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
        // read host from TruffleContract
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

    it("should lock 5 tokens for Alice with a secret hash", async () => {
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
        let totalSupply = await initialStorage.token.totalSupply;
        totalSupply = Number(totalSupply);
        expect(Number(storage.token.totalSupply)).to.equal(totalSupply);

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

    it("should not allow to reuse a secret hash", async () => {
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

    it("should not allow Alice to lock more funds than she has", async () => {
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

    it("should not allow Bob to confirm Alice' swap", async () => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7Instance.address);
        await expect(contract.methods.confirmSwap(expectedSwap.secretHash).send()).to.be.rejectedWith("NoPermission");
    });

    it("should allow Alice to confirm swap", async () => {
        await tzip7Instance.confirmSwap(expectedSwap.secretHash);
        const swap = await storage.bridge.swaps.get(expectedSwap.secretHash);
        expect(swap.confirmed).to.equal(true);
    });

    it("should not allow Bob to redeem with the invalid secret/ non-existing swap", async () => {        
        await expect(tzip7Instance.redeem("fffb")).to.be.rejectedWith("SwapLockDoesNotExist")
    });

    it("should not allow to redeem with too long secret", async () => {
        const byteArray = randomBytes.sync(33);
        const longSecret = toHexString(byteArray);
        await expect(tzip7Instance.redeem(longSecret)).to.be.rejectedWith("TooLongSecret");
    });

    it("should allow Bob to redeem 5 tokens with the correct secret", async () => {
        await tzip7Instance.redeem(secret)
        storage = await tzip7Instance.storage();
        // Bob receives 5 tokens
        const balanceBob = await storage.token.ledger.get(bob.pkh);
        expect(Number(balanceBob)).to.equal(expectedSwap.value + expectedSwap.fee);
        // outcome updates to secret
        const savedOutcomeSecret = await storage.bridge.outcomes.get(expectedSwap.secretHash);
        expect(savedOutcomeSecret).to.equal(secret);
        // swap entry deleted
        await storage.bridge.swaps.get(expectedSwap.secretHash);
    });

    it("should not allow Bob to redeem twice", async () => {
        await expect(tzip7Instance.redeem(secret)).to.be.rejectedWith("SwapLockDoesNotExist");
    });

    it("should not allow Bob to redeem past release time ", async () => {
        // TODO change lockID to secretHash
        const secret = "ffaa";
        const secretHash = hash(secret)
        const releasetimePast = getISOTimeWithDelay(-2);
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7Instance.lock(
            true, // confirmed set true
            expectedSwap.fee, 
            releasetimePast, 
            secretHash, 
            expectedSwap.to_,
            smallAmount
        );
        // Bob tries to redeem token, but has surpassed the release date for the swap
        await expect(tzip7Instance.redeem(secret)).to.be.rejectedWith("SwapIsOver");
    });

    it("should allow to swap 5 tokens without a fee", async () => {
        const secret = "ffaf";
        const secretHash = hash(secret);
        storage = await tzip7Instance.storage();
        const balanceAliceBeforeSwap = Number(await storage.token.ledger.get(alice.pkh));
        // it might be that Bob doesn't have a balance yet, that's why we are assigning 0 in this test
        let balanceBobBeforeSwap = await storage.token.ledger.get(bob.pkh) || 0;
        balanceBobBeforeSwap = Number(balanceBobBeforeSwap);
        
        // call the token contract at the %lock entrypoint
        await tzip7Instance.lock(
            expectedSwap.confirmed,
            null,
            expectedSwap.releaseTime,
            secretHash,
            expectedSwap.to_,
            expectedSwap.value
        );
        await tzip7Instance.confirmSwap(secretHash)
        // Bob redeems
        await tzip7Instance.redeem(secret)
        // read contract's storage
        storage = await tzip7Instance.storage();
        
        // check that total supply did not change
        let initialTotalSupply = Number(initialStorage.token.totalSupply);
        let totalSupply = Number(storage.token.totalSupply);
        expect(totalSupply).to.equal(initialTotalSupply);

        // check that balance was locked for Alice
        let aliceBalance = await storage.token.ledger.get(alice.pkh);
        aliceBalance = Number(aliceBalance);
        expect(aliceBalance).to.equal(balanceAliceBeforeSwap - expectedSwap.value);
        let bobBalance = await storage.token.ledger.get(bob.pkh);
        bobBalance = Number(bobBalance);
        expect(bobBalance).to.equal(balanceBobBeforeSwap + expectedSwap.value)
    
        // read the outcome post swap
        const savedOutcomeSecret = await storage.bridge.outcomes.get(secretHash);
        expect(savedOutcomeSecret).to.equal(secret);
        expect(await storage.bridge.swaps.get(secretHash)).to.be.undefined;
    });

    const newSecret = "ffab";
    const newSecretHash = hash(newSecret);
    it("should allow Alice to claim a refund after passing the time lock period", async () => {
        storage = await tzip7Instance.storage();
        const balanceAliceBeforeSwap = Number(await storage.token.ledger.get(alice.pkh));
        const balanceBobBeforeSwap = Number(await storage.token.ledger.get(bob.pkh));

        const releasetimePast = getISOTimeWithDelay(-1);
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7Instance.lock(
            true,  
            expectedSwap.fee,
            releasetimePast,
            newSecretHash,
            expectedSwap.to_,
            smallAmount
        );
        // Swap has surpassed the release date for the swap and Alice claims refund
        await tzip7Instance.claimRefund(newSecretHash);
        storage = await tzip7Instance.storage();
        
        const balanceAlice = Number(await storage.token.ledger.get(alice.pkh));
        expect(balanceAlice).to.equal(balanceAliceBeforeSwap - expectedSwap.fee);
        
        const balanceBob = Number(await storage.token.ledger.get(bob.pkh));
        expect(balanceBob).to.equal(balanceBobBeforeSwap + expectedSwap.fee);

    });

    it("should not allow Bob to redeem swap that was already refunded to Alice", async () => {
        await expect(tzip7Instance.redeem(secret)).to.be.rejectedWith("SwapLockDoesNotExist");
    });

    it("should not allow Alice to claim refund before passing the time lock", async () => {
        const newSecret = "ffac";
        const newSecretHash = hash(newSecret);
        const releasetimePast = getISOTimeWithDelay(1);
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7Instance.lock(  
            true,
            expectedSwap.fee,
            releasetimePast,
            newSecretHash,
            expectedSwap.to_,
            smallAmount
        );
        // Alice tries to redeem token, but has surpassed the release date for the swap
        await expect(tzip7Instance.claimRefund(newSecretHash)).to.be.rejectedWith("FundsLock");
    });   
});
