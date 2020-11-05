const tzip7 = artifacts.require('tzip-7');
const getViews = artifacts.require('getViews');
const crypto = require('crypto');
const { expect } = require('chai').use(require('chai-as-promised'));
const { Tezos } = require('@taquito/taquito')
const { InMemorySigner } = require('@taquito/signer')

const { alice, bob } = require('./../../scripts/sandbox/accounts');
const { initialStorage } = require('./../../migrations/1_deploy_tzip-7');
const randomBytes = require('random-bytes');

function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
};

function hash(payload) {
    const data = Buffer.from(hexToBytes(payload));
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return `${ hash.digest('hex') }`
};

function getISOTimeWithDelay(hours) {
    const timeNow = new Date();
    timeNow.setHours( timeNow.getHours() + hours);
    // Remove milliseconds for Tezos protocol
    timeNow.setMilliseconds(000);
    const timeWithDelay = timeNow.toISOString();
    return timeWithDelay
};

contract('TZIP-7 extended with hashed time-lock swap', accounts => {
    let storage;
    let tzip7Instance;
    let getViewsInstance;
    let rpc;
    
    async function updateStorage() {
        storage = await tzip7Instance.storage();
    };

    async function getBalance(address) {
        await updateStorage();
        // read balance and if no address was registered yet, assign a 0 balance
        let balance = await storage.token.ledger.get(address) || 0;
        balance = Number(balance);
        return balance
    };

    before(async () => {
        tzip7Instance = await tzip7.deployed();
        getViewsInstance = await getViews.deployed();
        // display the current contract address for debugging purposes
        console.log('Extended TZIP-7 deployed at:', tzip7Instance.address);
        console.log('Get View contract deployed at:', getViewsInstance.address);
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

    const swapRecord = {
        confirmed: false,
        fee: fee,
        from: alice.pkh,
        to: bob.pkh,
        value: amount,
        releaseTime: deadlineIn2Hours,
    };
    describe("Lock", () => {

        it("should lock 5 tokens for Alice with a secret-hash", async () => {
            let lockedBalanceBeforeSwap = await getBalance(tzip7Instance.address);
            let balanceAliceBeforeSwap = await getBalance(alice.pkh);

            // call the token contract at the %lock entrypoint
            await tzip7Instance.lock(
                swapRecord.confirmed,
                swapRecord.fee,
                swapRecord.releaseTime,
                secretHash,
                swapRecord.to,
                swapRecord.value
            );
            // read contract's storage
            await updateStorage();
            let lockedBalance = await getBalance(tzip7Instance.address);
            // check that locked amount was accredited to contract's address t
            expect(lockedBalance).to.equal(lockedBalanceBeforeSwap + swapRecord.value + swapRecord.fee);
    
            // check that total supply did not change
            let totalSupply = await initialStorage.token.totalSupply;
            totalSupply = Number(totalSupply);
            expect(Number(storage.token.totalSupply)).to.equal(totalSupply);
    
            // check that balance was locked for Alice
            let balanceAlice = await getBalance(alice.pkh);
            expect(balanceAlice).to.equal(balanceAliceBeforeSwap - amount - fee);
    
            // swap entry matches lock parameters
            const swap = await storage.bridge.swaps.get(secretHash);
            expect(swap.confirmed).to.equal(swapRecord.confirmed);
            expect(Number(swap.fee)).to.equal(swapRecord.fee);
            expect(swap.from).to.equal(swapRecord.from);
            expect(swap.releaseTime).to.equal(swapRecord.releaseTime);
            expect(swap.to).to.equal(swapRecord.to)
            expect(Number(swap.value)).to.equal(swapRecord.value);
        });

        it("should not allow to reuse a secret-hash", async () => {
            // call the token contract at the %lock entrypoint with an already used lockId 
            await expect(tzip7Instance.lock( 
                swapRecord.confirmed,
                swapRecord.fee,
                swapRecord.releaseTime,
                secretHash,
                swapRecord.to,
                swapRecord.value
            )).to.be.rejectedWith("SwapLockAlreadyExists");
        });

        it("should not allow Alice to lock more funds than she has", async () => {
            const secretHash = "ffae";
            const bigAmount = 100;
            // Alice locks 1 token with an expiration date in the past
            await expect(tzip7Instance.lock(  
                swapRecord.confirmed,
                swapRecord.fee,
                swapRecord.releaseTime,
                secretHash,
                swapRecord.to,
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
            await expect(contract.methods.confirmSwap(secretHash).send()).to.be.rejectedWith("NoPermission");
        });
    
        it("should allow Alice to confirm swap", async () => {
            await tzip7Instance.confirmSwap(secretHash);
            const swap = await storage.bridge.swaps.get(secretHash);
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
            const balanceBob = await getBalance(bob.pkh);
            expect(balanceBob).to.equal(swapRecord.value + swapRecord.fee);
            // outcome updates to secretHexString
            const savedOutcomeSecret = await storage.bridge.outcomes.get(secretHash);
            expect(savedOutcomeSecret).to.equal(secretHexString);
            // swap entry deleted
            expect(await storage.bridge.swaps.get(secretHash)).to.be.undefined;
        });
    
        it("should not allow Bob to redeem twice", async () => {
            await expect(tzip7Instance.redeem(secretHexString)).to.be.rejectedWith("SwapLockDoesNotExist");
        });
    
        it("should not allow Bob to redeem past release time ", async () => {
            const secretHexStringPastRelease = toHexString(randomBytes.sync(32));
            const secretHashPastRelease = hash(secretHexStringPastRelease)
            const releasetimePast = getISOTimeWithDelay(-2);
            const smallAmount = 1;
            // Alice locks 1 token with an expiration date in the past
            await tzip7Instance.lock(
                true, // confirmed set true
                swapRecord.fee, 
                releasetimePast, 
                secretHashPastRelease, 
                swapRecord.to,
                smallAmount
            );
            // Bob tries to redeem token, but has surpassed the release date for the swap
            await expect(tzip7Instance.redeem(secretHexStringPastRelease)).to.be.rejectedWith("SwapIsOver");
        });
    });

    describe("Claim Refund", () => {
        const secretClaimRefund = toHexString(randomBytes.sync(32));
        const secretHashClaimRefund = hash(secretClaimRefund);
        it("should allow Alice to claim a refund after passing the time lock period", async () => {
            const balanceAliceBeforeSwap = await getBalance(alice.pkh);
            const balanceBobBeforeSwap = await getBalance(bob.pkh);

            const releasetimePast = getISOTimeWithDelay(-1);
            const smallAmount = 1;
            // Alice locks 1 token with an expiration date in the past
            await tzip7Instance.lock(
                true,  
                swapRecord.fee,
                releasetimePast,
                secretHashClaimRefund,
                swapRecord.to,
                smallAmount
            );
            // Swap has surpassed the release date for the swap and Alice claims refund
            await tzip7Instance.claimRefund(secretHashClaimRefund);
            await updateStorage();
            
            const balanceAlice = await getBalance(alice.pkh);
            expect(balanceAlice).to.equal(balanceAliceBeforeSwap - swapRecord.fee);
            
            const balanceBob = await getBalance(bob.pkh);
            expect(balanceBob).to.equal(balanceBobBeforeSwap + swapRecord.fee);

        });

        it("should not allow Bob to redeem swap that was already refunded to Alice", async () => {
            await expect(tzip7Instance.redeem(secretHexString)).to.be.rejectedWith("SwapLockDoesNotExist");
        });

        it("should not allow Alice to claim refund before passing the time lock", async () => {
            const secretClaimRefund = toHexString(randomBytes.sync(32));
            const secretHashClaimRefund = hash(secretClaimRefund);
            const releasetimePast = getISOTimeWithDelay(1);
            const smallAmount = 1;
            // Alice locks 1 token with an expiration date in the past
            await tzip7Instance.lock(  
                true,
                swapRecord.fee,
                releasetimePast,
                secretHashClaimRefund,
                swapRecord.to,
                smallAmount
            );
            // Alice tries to redeem token, but has surpassed the release date for the swap
            await expect(tzip7Instance.claimRefund(secretHashClaimRefund)).to.be.rejectedWith("FundsLock");
        });   
    });
    
    describe("Get Contract Views", () => {
        it("should view outcome of a performed swap", async () => {
            await getViewsInstance.requestOutcome(tzip7Instance.address, secretHash)
            
            let storageGetViewsInstance = await getViewsInstance.storage()
            const secret = storageGetViewsInstance.outcome;
            expect(secret).to.equal(secretHexString);
        });

        it("should view swap of a pending swap", async () => {
            const secretGetView = toHexString(randomBytes.sync(32));
            const secretHashGetView = hash(secretGetView);
            
            await tzip7Instance.lock(
                swapRecord.confirmed,
                swapRecord.fee,
                swapRecord.releaseTime,
                secretHashGetView,
                swapRecord.to,
                swapRecord.value
            );

            await getViewsInstance.requestSwap(tzip7Instance.address, secretHashGetView);

            let storageGetViewsInstance = await getViewsInstance.storage()
            const swap = storageGetViewsInstance.swap;
            expect(swap.confirmed).to.equal(swapRecord.confirmed);
            expect(Number(swap.fee)).to.equal(swapRecord.fee);
            expect(swap.from).to.equal(swapRecord.from);
            expect(swap.releaseTime).to.equal(swapRecord.releaseTime);
            expect(swap.to).to.equal(swapRecord.to);
            expect(Number(swap.value)).to.equal(swapRecord.value);
        });
    });
});
