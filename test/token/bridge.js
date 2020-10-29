const tzip7 = artifacts.require('tzip-7');
const crypto = require('crypto');
const { expect } = require('chai').use(require('chai-as-promised'));
const { Tezos, UnitValue, ParameterSchema } = require('@taquito/taquito')
const { InMemorySigner } = require('@taquito/signer')

const { alice, bob } = require('./../../scripts/sandbox/accounts');
const { initialStorage } = require('./../../migrations/2_deploy_tzip-7');
const randomBytes = require('random-bytes');
const blake2 = require('blake2');


function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

function hash(payload) {
    const data = Buffer.from(payload,'hex');
    const hash = blake2.createHash('blake2b', {digestLength: 32});
    hash.update(data);
    return hash.digest('hex')
};

function getISOTimeWithDelay(hours) {
    const timeNow = new Date();
    timeNow.setHours( timeNow.getHours() + hours);
    // for Tezos protocol without milliseconds
    timeNow.setMilliseconds(000);
    const timeWithDelay = timeNow.toISOString();
    return timeWithDelay
};


contract('TZIP-7 extended with hashed time-lock swap', accounts => {
    let storage;
    let tzip7Instance;
    let rpc;

    async function updateStorage() {
        storage = await tzip7Instance.storage();
    };

    before(async () => {
        tzip7Instance = await tzip7.deployed();
        // display the current contract address for debugging purposes
        console.log('Contract deployed at:', tzip7Instance.address);
        // read host from TruffleContract
        rpc = tzip7Instance.constructor.currentProvider.host;
    });

    beforeEach(async () => {
        await updateStorage();
    });

    const secretHexString = toHexString(randomBytes.sync(32));
    const secretHash = hash(secretHexString);
    const amount = 5;
    const fee = 1;
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
    describe("Lock", () => {

        it("should lock 5 tokens for Alice without a fee", async () => {
            const secretHexString = toHexString(randomBytes.sync(32));
            const secretHash = hash(secretHexString);
            const balanceAliceBeforeSwap = Number(await storage.token.ledger.get(alice.pkh));
            // it might be that the accounts below don't have a balance yet, that's why a balance of 0 is assigned in this test
            let lockedBalanceBeforeSwap = await storage.token.ledger.get(tzip7Instance.address) || 0;
            lockedBalanceBeforeSwap = Number(lockedBalanceBeforeSwap);
            let balanceBobBeforeSwap = await storage.token.ledger.get(bob.pkh) || 0;
            balanceBobBeforeSwap = Number(balanceBobBeforeSwap);
            
            // call the token contract at the %lock entrypoint
            await tzip7Instance.lock(
                expectedSwap.confirmed,
                null, // fee
                expectedSwap.releaseTime,
                secretHash,
                expectedSwap.to_,
                expectedSwap.value
            );

            // read contract's storage
            await updateStorage();
            let lockedBalance = await storage.token.ledger.get(tzip7Instance.address);
            lockedBalance = Number(lockedBalance);
            // locked amount was accredited to contract's address to be the escrow
            expect(lockedBalance).to.equal(lockedBalanceBeforeSwap + amount);

            // check that total supply did not change
            let totalSupply = await initialStorage.token.totalSupply;
            totalSupply = Number(totalSupply);
            expect(Number(storage.token.totalSupply)).to.equal(totalSupply);

            // check that balance was locked for Alice
            let balanceAlice = await storage.token.ledger.get(alice.pkh);
            balanceAlice = Number(balanceAlice);
            expect(Number(balanceAlice)).to.equal(balanceAliceBeforeSwap - amount);
                
            // swap entry matches lock parameters
            const swap = await storage.bridge.swaps.get(secretHash);

            expect(swap.confirmed).to.equal(expectedSwap.confirmed);
            expect(swap.fee).to.be.null;
            expect(swap.from_).to.equal(expectedSwap.from_);
            expect(swap.releaseTime).to.equal(expectedSwap.releaseTime);
            expect(swap.secretHash).to.equal(secretHash);
            expect(swap.to_).to.equal(expectedSwap.to_)
            expect(Number(swap.value)).to.equal(expectedSwap.value);
        });

        it("should lock 5 tokens for Alice with a secret-hash", async () => {
            // it might be that smart contract doesn't have a balance yet, that's why we are assigning 0 in this test
            let lockedBalanceBeforeSwap = await storage.token.ledger.get(tzip7Instance.address) || 0;
            lockedBalanceBeforeSwap = Number(lockedBalanceBeforeSwap);
            let balanceAliceBeforeSwap = await storage.token.ledger.get(alice.pkh);
            balanceAliceBeforeSwap = Number(balanceAliceBeforeSwap);
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
            await updateStorage();
            let lockedBalance = await storage.token.ledger.get(tzip7Instance.address);
            lockedBalance = Number(lockedBalance);
            // check that locked amount was accredited to contract's address t
            expect(lockedBalance).to.equal(lockedBalanceBeforeSwap + expectedSwap.value + expectedSwap.fee);
    
            // check that total supply did not change
            let totalSupply = await initialStorage.token.totalSupply;
            totalSupply = Number(totalSupply);
            expect(Number(storage.token.totalSupply)).to.equal(totalSupply);
    
            // check that balance was locked for Alice
            let balanceAlice = await storage.token.ledger.get(alice.pkh);
            balanceAlice = Number(balanceAlice);
            expect(Number(balanceAlice)).to.equal(balanceAliceBeforeSwap - amount - fee);
    
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

        it("should not allow to reuse a secret-hash", async () => {
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
    });
    
    describe("Confirm Swap", () => {
        it("should not allow Bob to confirm Alice' swap", async () => {
            // switching to Bob's secretHexString key
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
    });
   
    describe("Redeem", () => {
        it("should not allow Bob to redeem with the invalid secret/ non-existing swap", async () => {        
            await expect(tzip7Instance.redeem("fffb")).to.be.rejectedWith("SwapLockDoesNotExist")
        });
    
        it("should not allow to redeem with too long secret", async () => {
            const byteArray = randomBytes.sync(33);
            const longSecret = toHexString(byteArray);
            await expect(tzip7Instance.redeem(longSecret)).to.be.rejectedWith("TooLongSecret");
        });
    
        it("should allow Bob to redeem 5 tokens with the correct secret", async () => {
            await tzip7Instance.redeem(secretHexString)
            await updateStorage();
            // Bob receives 5 tokens
            const balanceBob = await storage.token.ledger.get(bob.pkh);
            expect(Number(balanceBob)).to.equal(expectedSwap.value + expectedSwap.fee);
            // outcome updates to secretHexString
            const savedOutcomeSecret = await storage.bridge.outcomes.get(expectedSwap.secretHash);
            expect(savedOutcomeSecret).to.equal(secretHexString);
            // swap entry deleted
            await storage.bridge.swaps.get(expectedSwap.secretHash);
        });
    
        it("should not allow Bob to redeem twice", async () => {
            await expect(tzip7Instance.redeem(secretHexString)).to.be.rejectedWith("SwapLockDoesNotExist");
        });
    
        it("should not allow Bob to redeem past release time ", async () => {
            const secretHexString = "ffaa";
            const secretHash = hash(secretHexString)
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
            await expect(tzip7Instance.redeem(secretHexString)).to.be.rejectedWith("SwapIsOver");
        });

        it("should allow to swap 5 tokens without a fee", async () => {
            const secretHexString = toHexString(randomBytes.sync(32));
            const secretHash = hash(secretHexString);
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
            await tzip7Instance.redeem(secretHexString)
            // read contract's storage after operations
            await updateStorage();
            
            // check that total supply did not change
            let initialTotalSupply = Number(initialStorage.token.totalSupply);
            let totalSupply = Number(storage.token.totalSupply);
            expect(totalSupply).to.equal(initialTotalSupply);
    
            // check that balance was locked for Alice
            let balanceAlice = await storage.token.ledger.get(alice.pkh);
            balanceAlice = Number(balanceAlice);
            expect(balanceAlice).to.equal(balanceAliceBeforeSwap - expectedSwap.value);
            let bobBalance = await storage.token.ledger.get(bob.pkh);
            bobBalance = Number(bobBalance);
            expect(bobBalance).to.equal(balanceBobBeforeSwap + expectedSwap.value)
        
            // read the outcome post swap
            const savedOutcomeSecret = await storage.bridge.outcomes.get(secretHash);
            expect(savedOutcomeSecret).to.equal(secretHexString);
            expect(await storage.bridge.swaps.get(secretHash)).to.be.undefined;
        });
    });

    describe("Claim Refund", () => {
        const newSecretHexString = toHexString(randomBytes.sync(32));
        const newSecretHash = hash(newSecretHexString);
        it("should allow Alice to claim a refund after passing the time lock period", async () => {
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
            await updateStorage();
            
            const balanceAlice = Number(await storage.token.ledger.get(alice.pkh));
            expect(balanceAlice).to.equal(balanceAliceBeforeSwap - expectedSwap.fee);
            
            const balanceBob = Number(await storage.token.ledger.get(bob.pkh));
            expect(balanceBob).to.equal(balanceBobBeforeSwap + expectedSwap.fee);

        });

        it("should not allow Bob to redeem swap that was already refunded to Alice", async () => {
            await expect(tzip7Instance.redeem(secretHexString)).to.be.rejectedWith("SwapLockDoesNotExist");
        });

        it("should not allow Alice to claim refund before passing the time lock", async () => {
            const newSecretHexString = toHexString(randomBytes.sync(32));
            const newSecretHash = hash(newSecretHexString);
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
});
