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
        confirmed: undefined,
        fee: 10,
        releaseTime: getDelayedISOTime(2),
        secretHash: undefined,
        to: accounts.recipient.pkh,
        value: 5000
    };

    describe('Invoke %redeem on bridge for a confirmed swap', () => {

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
            swapLockParameters.confirmed = true;
            await helpers.tzip7.lock(swapLockParameters);
        });

        it('should work with correct secret', async () => {
            const operationPromise = helpers.tzip7.redeem(swapSecret);
            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        it('should fail to retrieve swap with the wrong secret' , async () => {
            const operationPromise = helpers.tzip7.redeem(_cryptoHelpers.randomSecret());
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapLockDoesNotExist);
        });

        it('should fail for too long secret' , async () => {
            const operationPromise = helpers.tzip7.redeem(_cryptoHelpers.randomSecret(33));
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.tooLongSecret);
        });

        describe('Effects of redeem', () => {

            beforeEach(async () => {
                helpers.balances.senderBeforeRedeem = await helpers.tzip7.getBalance(accounts.sender.pkh);
                await helpers.tzip7.redeem(swapSecret);
            });
            
            it("should reduce token balance for lockSaver", async () => {
                const lockSaverBalance = await helpers.tzip7.getBalance(accounts.lockSaver.pkh);
                expect(lockSaverBalance).to.equal(0);
            });

            it("should increase token balance for recipient", async () => {
                const recipient = await helpers.tzip7.getBalance(accounts.recipient.pkh);
                const totalSwapValue = swapLockParameters.value + swapLockParameters.fee;
                expect(recipient).to.equal(helpers.balances.recipientBefore + totalSwapValue);
            });

            it('should not change balance of sender', async () => {
                const sender = await helpers.tzip7.getBalance(accounts.sender.pkh);
                expect(sender).to.equal(helpers.balances.senderBeforeRedeem);
            });
            
            it('should save outcomes to storage', async () => {
                const outcome = await helpers.tzip7.getOutcomes(swapLockParameters.secretHash);
                expect(outcome).to.equal(swapSecret);
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

        it('should fail if token operations are paused', async () => {
            // call %setPause with pause guardian
            await _taquitoHelpers.signAs(accounts.pauseGuardian.sk, async () => {
                await helpers.tzip7.setPause(true);
            });

            const operationPromise = helpers.tzip7.redeem(swapSecret);

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
        });
    });

    describe('Invoke %redeem on bridge for an unconfirmed swap', () => {

        beforeEach(async () => {
            await before(
                _tzip7InitialStorage.withApprovals,
                accounts,
                helpers,
            );
            // locking through contract call is leaner than migrating swap
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            swapSecret = _cryptoHelpers.randomSecret();
            swapLockParameters.secretHash = _cryptoHelpers.hash(swapSecret);
            swapLockParameters.confirmed = false;
            await helpers.tzip7.lock(swapLockParameters);
        });

        it('should fail for an unconfirmed swap', async () => {
            const operationPromise = helpers.tzip7.redeem(swapSecret);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapIsNotConfirmed);
        });
    });

    describe('Invoke %redeem on bridge for a confirmed swap when release time is passed', () => {

        beforeEach(async () => {
            await before(
                _tzip7InitialStorage.withApprovals,
                accounts,
                helpers,
            );
            // locking through contract call is leaner than migrating swap
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            swapSecret = _cryptoHelpers.randomSecret();
            swapLockParameters.secretHash = _cryptoHelpers.hash(swapSecret);
            swapLockParameters.confirmed = true;
            swapLockParameters.releaseTime = getDelayedISOTime(-1); // 1h in the past
            await helpers.tzip7.lock(swapLockParameters);
        });

        it('should fail for an unconfirmed swap', async () => {
            const operationPromise = await helpers.tzip7.redeem(swapSecret);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.swapIsOver);
        });
    });
});
