const tzip7 = artifacts.require('tzip7');
const crypto = require('crypto');
const { expect } = require('chai').use(require('chai-as-promised'));
const { Tezos } = require('@taquito/taquito')
const { InMemorySigner } = require('@taquito/signer')

const { alice, bob } = require('./../../scripts/sandbox/accounts');

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
};

function hash(payload) {
    const data = Buffer.from(hexToBytes(payload))
    const hash = crypto.createHash('sha256')
    hash.update(data)
    return `${ hash.digest('hex') }`
};

contract('TZIP7 extended with hashed time-lock swap', accounts => {
    let storage;
    let tzip7_instance;
    let rpc;

    before(async () => {
        tzip7_instance = await tzip7.deployed();
        /**
         * Display the current contract address for debugging purposes
         */
        console.log('Contract deployed at:', tzip7_instance.address);
        /**
         * Final setup for test suite
         * Read host from TruffleContract
         */
        rpc = tzip7_instance.constructor.currentProvider.host
    });
    
    /**
     *  Token tests
     */
    it("should mint 10 tokens for Alice", async () => {
        // calling the token contract %mint entrypoint
        await tzip7_instance.mint(alice.pkh, 10);
        storage = await tzip7_instance.storage();
        actualBalance = await storage.token.ledger.get(alice.pkh);
        expectedBalance = 20;
        expect(Number(actualBalance)).to.equal(expectedBalance);
        expect(Number(storage.token.totalSupply)).to.equal(expectedBalance);
    });

    it("should not change the adminstrator's address for Bob", async() => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7_instance.address);
        // call the token contract at the %setAdministrator entrypoint and passing Bob's address
        await expect(contract.methods.setAdministrator(bob.pkh).send()).to.be.rejectedWith("NoPermission");
    });

    it("should burn 10 tokens for Alice", async () => {
        // calling the token contract %burn entrypoint
        await tzip7_instance.burn(alice.pkh, 10);
        storage = await tzip7_instance.storage();
        actualBalance = await storage.token.ledger.get(alice.pkh);
        expectedBalance = 10;
        expect(Number(actualBalance)).to.equal(expectedBalance);
        expect(Number(storage.token.totalSupply)).to.equal(expectedBalance);
    });
    
    it("should fail for burning more tokens than Alice has", async () => {
        // calling the token contract %burn entrypoint
        await expect(tzip7_instance.burn(alice.pkh, 20)).to.be.rejectedWith("NotEnoughBalance");
    });

    it("should not burn any tokens for someone other than the admin", async() => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7_instance.address);
        // call the token contract at the %burn entrypoint
        await expect(contract.methods.burn(alice.pkh, 5).send()).to.be.rejectedWith("NoPermission");
    });
  

    //////////////////////////////////
    // ***** Cross Chain Swap  *****//
    //////////////////////////////////

    const lockId = "ffff"
    const secret = "fffa"
    const secretHash = hash(secret)
    const amount = 5

    const expectedSwap = {
        from_: alice.pkh, 
        to_: bob.pkh, 
        value: amount, 
        releaseTime: "2020-10-31T15:08:29.000Z"       
    }

    it("should lock 5 tokens for Alice", async () => {
        // call the token contract at the %lock entrypoint
        await tzip7_instance.lock(  
            lockId, 
            "2020-10-31T15:08:29.000Z", 
            secretHash,
            bob.pkh, 
            amount
        );
        // read contract's storage
        storage = await tzip7_instance.storage();
        const lockedBalance = await storage.token.ledger.get(tzip7_instance.address);
        expect(Number(lockedBalance)).to.equal(amount);
    });

    it("should not allow to reuse a lockId", async () => {
        // call the token contract at the %lock entrypoint with an already used lockId 
        await expect(tzip7_instance.lock( 
            lockId, 
            "2020-10-31T15:08:29.000Z", 
            secretHash, 
            bob.pkh,
            amount
        )).to.be.rejectedWith("SwapLockAlreadyExists");
    });

    /**
     * BOB checks secretHash on chain A using the lockId
     */
    it("should validate the swap entry for Bob", async () => {
        storage = await tzip7_instance.storage()
        const swapsEntry = await storage.bridge.swaps.get(lockId)
        expect(swapsEntry.from).to.equal(expectedSwap.from)
        expect(swapsEntry.to).to.equal(expectedSwap.to)
        expect(Number(swapsEntry.value)).to.be.equal(expectedSwap.value)
        expect(swapsEntry.releaseTime).to.equal(expectedSwap.releaseTime)
    });

    it("should not allow Bob to redeem with the wrong secret", async () => {        
        await expect(tzip7_instance.redeem(lockId, "fffb")).to.be.rejectedWith("InvalidSecret")
    });

    it("should not allow Bob to redeem with the wrong lockId", async () => {        
        await expect(tzip7_instance.redeem("ff", secret)).to.be.rejectedWith("SwapLockDoesNotExist")
    });

    it("should allow Bob to redeem 5 tokens with the correct secret", async () => {
        const operation = await tzip7_instance.redeem(lockId, secret)
        storage = await tzip7_instance.storage();
        const balanceBob = await storage.token.ledger.get(bob.pkh);
        expect(Number(balanceBob)).to.equal(5);
    });

    it("should not allow Bob to redeem past release time ", async () => {
        const newlockId = "ffaa";
        const releasetimePast = "2020-09-30T15:08:29.000Z";
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7_instance.lock(  
            newlockId, 
            releasetimePast, 
            secretHash, 
            bob.pkh,
            smallAmount
        );
        // Bob tries to redeem token, but has surpassed the release date for the swap
        await expect(tzip7_instance.redeem(newlockId, secret)).to.be.rejectedWith("SwapIsOver");
    });

    it("should allow Alice to reclaim her funds after passing the time lock period", async () => {
        const newlockId = "ffab";
        const releasetimePast = "2020-09-30T15:08:29.000Z";
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7_instance.lock(  
            newlockId, 
            releasetimePast, 
            secretHash, 
            bob.pkh,
            smallAmount
        );
        // Bob tries to redeem token, but has surpassed the release date for the swap
        await tzip7_instance.claimRefund(newlockId);
        storage = await tzip7_instance.storage();
        console.log(storage.bridge.outcomes.get(newlockId))
        const balanceAlice = await storage.token.ledger.get(alice.pkh);
        return expect(Number(balanceAlice)).to.equal(4)
    });

    it("should not allow Alice to reclaim her funds before passing the time lock", async () => {
        const newlockId = "ffac";
        const releasetimePast = "2020-10-31T15:08:29.000Z";
        const smallAmount = 1;
        // Alice locks 1 token with an expiration date in the past
        await tzip7_instance.lock(  
            newlockId, 
            releasetimePast, 
            secretHash, 
            bob.pkh,
            smallAmount
        );
        // Bob tries to redeem token, but has surpassed the release date for the swap
        await expect(tzip7_instance.claimRefund(newlockId)).to.be.rejectedWith("FundsLock");
    });
});
