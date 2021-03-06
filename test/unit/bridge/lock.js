const { contractErrors } = require('./../../../helpers/constants');
const { TezosOperationError } = require('@taquito/taquito');
const getDelayedISOTime = require('../../../helpers/getDelayedISOTime');
const _cryptoHelpers = require('../../../helpers/crypto');
const _tzip7InitialStorage = require('./../../../migrations/initialStorage/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const { expect } = require('chai').use(require('chai-as-promised'));
const accounts = require('./accounts');
const before = require('./before');

contract('TZIP-7 with bridge', () => {
    let helpers = {};
    let swapLockParameters = {
        confirmed: false,
        fee: 1,
        releaseTime: undefined,
        secretHash: '',
        to: accounts.recipient.pkh,
        value: 5
    };

    describe('Invoke %lock on bridge with releaseTime far enough in the future', () => {
        
        beforeEach(async () => {
            await before(
                _tzip7InitialStorage.test.lock(), 
                accounts,
                helpers
            );
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            swapLockParameters.releaseTime = getDelayedISOTime(120); // 2 hours in the future
        });

        describe('Effects of %lock', () => {
            
            beforeEach(async () => {
                // call the token contract at the %lock entrypoint
                swapLockParameters.secretHash = _cryptoHelpers.randomHash();
                await helpers.tzip7.lock(swapLockParameters);
            });
            
            it("should reduce token balance for sender", async () => {
                helpers.balances.senderAfter = await helpers.tzip7.getBalance(accounts.sender.pkh);
                const totalSwapValue = swapLockParameters.value + swapLockParameters.fee;
                expect(helpers.balances.senderAfter).to.equal(helpers.balances.senderBefore - totalSwapValue);
            });

            it("should lock tokens by accrediting to lockSaver's address", async () => {
                helpers.balances.lockSaverAfter = await helpers.tzip7.getBalance(accounts.lockSaver.pkh);
                const totalSwapValue = swapLockParameters.value + swapLockParameters.fee;
                expect(helpers.balances.lockSaverAfter).to.equal(helpers.balances.lockSaverBefore + totalSwapValue);
            });

            it('should create swap record in contract storage', async () => {
                // swap entry matches lock parameters
                const swapId = {
                    0: swapLockParameters.secretHash,
                    1: accounts.sender.pkh // swap initiator
                }; 
                const swapFromContract = await helpers.tzip7.getSwap(swapId);
                let swapRecord = swapLockParameters;
                swapRecord.from = accounts.sender.pkh; // add this for assertion
                delete swapRecord.secretHash; // remove this for assertion
                expect(swapFromContract).to.include(swapRecord);
            });

            it('should not change total stupply' , async () => {
                const totalSupply = await helpers.tzip7.getTotalSupply();
                expect(totalSupply).to.equal(helpers.balances.totalSupplyBefore);
            });

            it('should not change balance of recepient', async () => {
                helpers.balances.recipientAfter = await helpers.tzip7.getBalance(swapLockParameters.to);
                expect(helpers.balances.recipientAfter).to.equal(helpers.balances.recipientBefore);
            })
        });
        
        it('should not allow to reuse a secret-hash', async () => {
            // call the token contract at the %lock entrypoint with an already used secretHash from initialStorage
            swapLockParameters.secretHash = _tzip7InitialStorage.test.lock().bridge.swaps.keys().next().value[0]

            const operationPromise = helpers.tzip7.lock(swapLockParameters);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapLockAlreadyExists);
        });

        it('should fail if token operations are paused', async () => {
            // call %setPause with pause guardian
            await _taquitoHelpers.signAs(accounts.pauseGuardian.sk, async () => {
                await helpers.tzip7.setPause(true);
            });

            const operationPromise = helpers.tzip7.lock(swapLockParameters);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
        });
    });

    describe('Invoke %lock on bridge with releaseTime not far enough in the future', () => {
        
        beforeEach(async () => {
            await before(
                _tzip7InitialStorage.test.lock(), 
                accounts,
                helpers
            );
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            // time threshold is current time + minimum time constant of 10 minutes
            // this test will fail when running many tests at once, because the
            // sandbox does not update network time after initialization (ganache-core)
            swapLockParameters.releaseTime = getDelayedISOTime(0); 
            swapLockParameters.secretHash = _cryptoHelpers.randomHash();
        });

        it('should fail if release time is earlier than time threshold', async () => {
            const operationPromise = helpers.tzip7.lock(swapLockParameters);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapTimeBelowThreshold);
        });
    });
});
