const { contractErrors } = require('./../../../helpers/constants');
const { TezosOperationError } = require('@taquito/taquito');
const _cryptoHelpers = require('../../../helpers/crypto');
const getDelayedISOTime = require('../../../helpers/getDelayedISOTime');
const _tzip7InitialStorage = require('./../../../migrations/initialStorage/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const { expect } = require('chai').use(require('chai-as-promised'));
const before = require('./before');
const accounts = require('./accounts');

contract('TZIP-7 with bridge', () => {
    let helpers = {};
    let swapSecret;
    let swapLockParameters = {
        confirmed: true,
        fee: 10,
        releaseTime: getDelayedISOTime(-1), // time in the past
        secretHash: undefined,
        to: accounts.recipient.pkh,
        value: 5000
    };

    describe('Invoke %claimRefund on bridge for a swap lock past the release time', () => {

        beforeEach(async () => {
            await before(
                _tzip7InitialStorage.withApprovals,
                accounts,
                helpers
            );
            // locking swap through contract call is leaner than migrating
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            swapSecret = _cryptoHelpers.randomSecret();
            swapLockParameters.secretHash = _cryptoHelpers.hash(swapSecret);
            await helpers.tzip7.lock(swapLockParameters);
        });


        it('should fail if token operations are paused', async () => {
            // call %setPause with pause guardian
            await _taquitoHelpers.signAs(accounts.pauseGuardian.sk, async () => {
                await helpers.tzip7.setPause(true);
            });

            const operationPromise = helpers.tzip7.claimRefund(swapLockParameters.secretHash);

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
        });

        it('should fail if sender is not initiator of the swap', async () => {
            await _taquitoHelpers.setSigner(accounts.thirdParty.sk);
            const operationPromise = helpers.tzip7.claimRefund(swapLockParameters.secretHash);            

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.senderIsNotTheInitiator);
        });

        it('should fail for a swap lock that does not exist', async () => {
            const operationPromise = helpers.tzip7.claimRefund(_cryptoHelpers.randomHash());
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapLockDoesNotExist);
        });

        describe('effects of invoking %claimRefund', () => {
            
            beforeEach(async () => {
                helpers.balances.senderBeforeClaimRefund = await helpers.tzip7.getBalance(accounts.sender.pkh);
                await helpers.tzip7.claimRefund(swapLockParameters.secretHash);
            });

            it("should reduce token balance for lockSaver", async () => {
                const lockSaverBalance = await helpers.tzip7.getBalance(accounts.lockSaver.pkh);
                expect(lockSaverBalance).to.equal(0);
            });

            it("should increase token balance for recipient by the swap lock fee", async () => {
                const recipient = await helpers.tzip7.getBalance(accounts.recipient.pkh);
                expect(recipient).to.equal(helpers.balances.recipientBefore + swapLockParameters.fee);
            });

            it('should increase token balance of sender by the swap lock value', async () => {
                const sender = await helpers.tzip7.getBalance(accounts.sender.pkh);
                expect(sender).to.equal(helpers.balances.senderBeforeClaimRefund + swapLockParameters.value);
            });
            
            it('should remove swap record in contract storage', async () => {
                // swap record not found
                const swap = await helpers.tzip7.getSwap(swapLockParameters.secretHash);
                // TODO: find better way of catching this storage read error
                expect(swap).to.be.undefined;
            });

            it('should not change total supply' , async () => {
                const totalSupply = await helpers.tzip7.getTotalSupply();
                expect(totalSupply).to.equal(helpers.balances.totalSupplyBefore);
            });
        });

        it("should fail to redeem an already refunded swap by recipient ", async () => {
            // claim refund by sender
            await helpers.tzip7.claimRefund(swapLockParameters.secretHash);
            // switch to recipient and invoke %redeem
            await _taquitoHelpers.setSigner(accounts.recipient.sk);
            const operationPromise = helpers.tzip7.redeem(swapLockParameters.secretHash);
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapLockDoesNotExist);
        });
    });

    describe('Invoke %claimRefund on bridge for a swap lock before the release time', () => {

        beforeEach(async () => {
            await before(
                _tzip7InitialStorage.withApprovals,
                accounts,
                helpers
            );
            // locking swap through contract call is leaner than migrating
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            swapSecret = _cryptoHelpers.randomSecret();
            swapLockParameters.secretHash = _cryptoHelpers.hash(swapSecret);
            swapLockParameters.releaseTime = getDelayedISOTime(1); // time in the future, release time not reached
            await helpers.tzip7.lock(swapLockParameters);
        });

        it('should fail for a swap lock that did not reach release time', async () => {
            const operationPromise = helpers.tzip7.claimRefund(swapLockParameters.secretHash);
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.fundsLock);
        });
    });
});