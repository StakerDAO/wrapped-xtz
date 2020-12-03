const tzip7 = artifacts.require('tzip-7');
const { alice, bob, carol, walter } = require('./../../../scripts/sandbox/accounts');
const { contractErrors } = require('./../../../helpers/constants');
const _tzip7InitialStorage = require('./../../../migrations/initialStorage/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const _tzip7Helpers = require('../../helpers/tzip-7');
const getDelayedISOTime = require('../../../helpers/getDelayedISOTime');

const { expect } = require('chai').use(require('chai-as-promised'));
const { TezosOperationError } = require('@taquito/taquito');
const { before } = require('lodash');


contract('TZIP-7 with bridge', accounts => {
    let helpers = {};
    let balances = {};
    // alice is admin of token contract
    const sender = bob;
    const recipient = carol;
    const pauseGuardian = walter;
    let swapRecord;

    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.lock);
        // display the current contract address for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);

        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(sender.sk);

        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
        balances.senderBeforeLock = await helpers.tzip7.getBalance(sender.pkh);
        balances.recipientBeforeLock = await helpers.tzip7.getBalance(recipient.pkh);
        balances.contractBeforeLock = await helpers.tzip7.getBalance(tzip7Instance.address);
        
        swapRecord = {
            confirmed: false,
            fee: 1,
            releaseTime: getDelayedISOTime(2),
            secretHash: helpers.tzip7.randomHash(),
            to: recipient.pkh,
            value: 5
        };
    });

    describe("%lock", () => {

        describe('Effects of lock', () => {
            
            beforeEach(async () => {
                // call the token contract at the %lock entrypoint
                await helpers.tzip7.lock(swapRecord);
            });
            
            it("should reduce token balance for sender", async () => {
                balances.senderAfterLock = await helpers.tzip7.getBalance(sender.pkh);
                expect(balances.senderAfterLock).to.equal(balances.senderBeforeLock - swapRecord.value - swapRecord.fee);
            });

            it("should lock tokens by accrediting to contract's address", async () => {
                // locked amount was accredited to contract's address
                balances.contractAfterLock = await helpers.tzip7.getBalance(tzip7Instance.address);
                expect(balances.contractAfterLock).to.equal(balances.contractBeforeLock + swapRecord.value + swapRecord.fee);
            });

            it('should create swap record in contract storage', async () => {
                // swap entry matches lock parameters
                const swapFromContract = await helpers.tzip7.getSwap(swapRecord.secretHash);
                swapRecord.from = sender.pkh; // add this for assertion
                delete swapRecord.secretHash; // remove this for assertion
                expect(swapFromContract).to.include(swapRecord);
            });

            it('should not change total stupply' , async () => {
                const totalSupply = _tzip7InitialStorage.withApprovals.token.totalSupply;
                expect(await helpers.tzip7.getTotalSupply()).to.equal(totalSupply);
            });

            it('should not change balance of recepient', async () => {
                balances.recipientAfterLock = await helpers.tzip7.getBalance(swapRecord.to);
                expect(balances.recipientAfterLock).to.equal(balances.recipientBeforeLock);
            })
        });
        
        it("should not allow to reuse a secret-hash", async () => {
            // call the token contract at the %lock entrypoint with an already used lockId
            swapRecord.secretHash = "b7c1fcab1eac98de7a021c73906e2c930cb46d9cf1c90aef6bd549f0ba00f25a";
            const operationPromise = helpers.tzip7.lock(swapRecord);
    
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapLockAlreadyExists);
        });

        it('should fail if token operations are paused', async () => {
            // call %setPause with pause guardian
            await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                await helpers.tzip7.setPause(true);
            });

            // call the token contract at the %lock entrypoint with an already used lockId 
            const operationPromise = helpers.tzip7.lock(swapRecord);

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
        });
    });
});
