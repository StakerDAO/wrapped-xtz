const tzip7 = artifacts.require('tzip-7');
const crypto = require('crypto');
const { expect } = require('chai').use(require('chai-as-promised'));
const { Tezos, UnitValue, ParameterSchema } = require('@taquito/taquito')
const { InMemorySigner } = require('@taquito/signer')

const { alice, bob } = require('./../../scripts/sandbox/accounts');
const { initialStorage } = require('./../../migrations/2_deploy_tzip-7');
const randomBytes = require('random-bytes');

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
};

function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

function hash(payload) {
    const data = Buffer.from(hexToBytes(payload))
    const hash = crypto.createHash('sha256')
    hash.update(data)
    return `${ hash.digest('hex') }`
};

contract('TZIP-7 extended with hashed time-lock swap', accounts => {
    let storage;
    let tzip7Instance;
    let rpc;

    before(async () => {
        tzip7Instance = await tzip7.deployed();

        // display the current contract address for debugging purposes
        console.log('Contract deployed at:', tzip7Instance.address);
        /**
         * Final setup for test suite
         * Read host from TruffleContract
         */
        rpc = tzip7Instance.constructor.currentProvider.host;
    });

    const lockId = toHexString(randomBytes.sync(6));
    const secret = "fffa"
    const secretHash = hash(secret)
    const amount = 5;
    const fee = 1;

    function getISOTimeWithDelay(hours) {
        const timeNow = new Date();
        timeNow.setHours( timeNow.getHours() + hours);
        // for Tezos protocol without milliseconds
        timeNow.setMilliseconds(000);
        const timeWithDelay = timeNow.toISOString();
        return timeWithDelay
    };

    const deadlineIn2Hours = getISOTimeWithDelay(2);

    const expectedSwap = {
        confirmed: false,
        fee: fee,
        from_: alice.pkh,
        to_: bob.pkh,
        secretHash: secretHash,
        value: amount,
        releaseTime: deadlineIn2Hours,
    };

    it.only("should lock 5 tokens for Alice with secret hash", async () => {
        // call the token contract at the %lock entrypoint
        await tzip7Instance.lock(
            expectedSwap.confirmed,
            expectedSwap.fee,
            expectedSwap.releaseTime,
            expectedSwap.secretHash,
            expectedSwap.to_,
            expectedSwap.value
        );
        // read contract's storage
        storage = await tzip7Instance.storage();
        const lockedBalance = await storage.token.ledger.get(tzip7Instance.address);

        // locked amount was accredited to contract's address to be the escrow
        expect(Number(lockedBalance)).to.equal(amount + fee);

        // check that total supply did not change
        expect(Number(storage.token.totalSupply)).to.equal(10);

        // check that balance was locked for Alice
        const aliceStartingBalance = await initialStorage.token.ledger.get(alice.pkh);
        const aliceBalance = await storage.token.ledger.get(alice.pkh);
        expect(Number(aliceBalance)).to.equal(aliceStartingBalance - amount - fee);

        // swap entry matches lock parameters
        const swap = await storage.bridge.swaps.get(expectedSwap.secretHash);
        expect(swap.confirmed).to.equal(expectedSwap.confirmed);
        expect(Number(swap.fee)).to.equal(expectedSwap.fee);
        expect(swap.from_).to.equal(expectedSwap.from_);
        expect(swap.releaseTime).to.equal(expectedSwap.releaseTime);
        expect(swap.secretHash).to.equal(expectedSwap.secretHash);
        expect(swap.to_).to.equal(expectedSwap.to_)
        expect(Number(swap.value)).to.equal(expectedSwap.value);
    });

    it.only("should not allow to reuse a lockId", async () => {
        // call the token contract at the %lock entrypoint with an already used lockId 
        await expect(tzip7Instance.lock( 
            expectedSwap.confirmed,
            expectedSwap.fee,
            expectedSwap.releaseTime,
            expectedSwap.secretHash,
            expectedSwap.to_,
            expectedSwap.value
        )).to.be.rejectedWith("SwapLockAlreadyExists");
    });

    it.only("should not allow Alice to lock more funds than she has", async () => {
        const secretHash = "ffae";
        const bigAmount = 100;
        // Alice locks 1 token with an expiration date in the past
        await expect(tzip7Instance.lock(  
            expectedSwap.confirmed,
            expectedSwap.fee,
            expectedSwap.releaseTime,
            secretHash,
            expectedSwap.to_,
            bigAmount
        )).to.be.rejectedWith("NotEnoughBalance");
    });

    it.only("should not allow Bob to confirm swap", async () => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7Instance.address);
        await expect(contract.methods.confirmSwap(expectedSwap.secretHash).send()).to.be.rejectedWith("NoPermission");
    });

    it.only("should allow Alice to confirm swap", async () => {
        await tzip7Instance.confirmSwap(expectedSwap.secretHash);
        const swap = await storage.bridge.swaps.get(expectedSwap.secretHash);
        expect(swap.confirmed).to.equal(true);
    });

    it("should not allow Bob to redeem with the invalid secret", async () => {        
        await expect(tzip7Instance.redeem(lockId, "fffb")).to.be.rejectedWith("InvalidSecret")
    });

    it("should not allow Bob to redeem for non-existing swap", async () => {        
        await expect(tzip7Instance.redeem("ff", secret)).to.be.rejectedWith("SwapLockDoesNotExist")
    });

    it("should not allow to redeem with too long secret", async () => {
        const byteArray = randomBytes.sync(33);
        const longSecret = toHexString(byteArray);
        await expect(tzip7Instance.redeem(lockId, longSecret)).to.be.rejectedWith("TooLongSecret");
    });

    it("should allow Bob to redeem 5 tokens with the correct secret", async () => {
        await tzip7Instance.redeem(lockId, secret)
        storage = await tzip7Instance.storage();
        // Bob receives 5 tokens
        const balanceBob = await storage.token.ledger.get(bob.pkh);
        expect(Number(balanceBob)).to.equal(5);
        // outcome updates to secret
        const outcomeSecret = await storage.bridge.outcomes.get(lockId);
        expect(outcomeSecret).to.equal(secret);
    });


    it("should not allow Bob to redeem twice", async () => {
        await expect(tzip7Instance.redeem(lockId, secret)).to.be.rejectedWith("SwapAlreadyPerformed");
    });

    it("should not allow Bob to redeem past release time ", async () => {
        const newlockId = "ffaa";
        const releasetimePast = getISOTimeWithDelay(-2);
        console.log(releasetimePast)
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7Instance.lock(  
            newlockId, 
            releasetimePast, 
            secretHash, 
            bob.pkh,
            smallAmount
        );
        // Bob tries to redeem token, but has surpassed the release date for the swap
        await expect(tzip7Instance.redeem(newlockId, secret)).to.be.rejectedWith("SwapIsOver");
    });

    const newlockId = "ffab";
    it("should allow Alice to claim a refund after passing the time lock period", async () => {
        const releasetimePast = getISOTimeWithDelay(-1);
        console.log(releasetimePast)
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7Instance.lock(  
            newlockId, 
            releasetimePast, 
            secretHash, 
            bob.pkh,
            smallAmount
        );
        // Swap has surpassed the release date for the swap and Alice claims refund
        await tzip7Instance.claimRefund(newlockId);
        storage = await tzip7Instance.storage();
        const balanceAlice = await storage.token.ledger.get(alice.pkh);
        expect(Number(balanceAlice)).to.equal(4)
    });

    it("should not allow Bob to redeem swap that was already refunded to Alice", async () => {
        await expect(tzip7Instance.redeem(newlockId, secret)).to.be.rejectedWith("SwapAlreadyRefunded");
    });

    it("should not allow Alice to claim refund before passing the time lock", async () => {
        const newlockId = "ffac";
        const releasetimePast = getISOTimeWithDelay(1);
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7Instance.lock(  
            newlockId, 
            releasetimePast, 
            secretHash, 
            bob.pkh,
            smallAmount
        );
        // Alice tries to redeem token, but has surpassed the release date for the swap
        await expect(tzip7Instance.claimRefund(newlockId)).to.be.rejectedWith("FundsLock");
    });

 

    const lockId03 = 'ffad';

    it.skip("should allow Alice to lock tokens without revealing the secret hash", async () => {
        // call the token contract at the %lock entrypoint
        await tzip7Instance.lock(  
            lockId03, 
            getISOTimeWithDelay(1),
            // TODO optional(bytes): None(), 
            bob.pkh, 
            amount
        );
        // read contract's storage
        storage = await tzip7Instance.storage()
        // swap entry exists
        await storage.bridge.swaps.get(lockId03)
    });

    it.skip("should allow Alice to reveal secret hash for existing swap", async () => {
        // call the token contract at the %lock entrypoint
        await tzip7Instance.revealSecretHash(  
            lockId03, 
            secretHash
        );
        // read contract's storage
        storage = await tzip7Instance.storage();
        const outcome = await storage.bridge.outcomes.get(lockId03);
        expect(outcome).to.equal(secretHash);
    });
   
});
