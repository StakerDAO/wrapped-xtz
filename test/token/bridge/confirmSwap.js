const tzip7 = artifacts.require('tzip-7');
const { alice, bob, carol, chuck, walter } = require('./../../../scripts/sandbox/accounts');
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
    // alice is admin of token contract
    const sender = bob;
    const recipient = carol;
    const thirdParty = chuck; // malicious intent
    const secretHashUnconfirmed = 'b7c1fcab1eac98de7a021c73906e2c930cb46d9cf1c90aef6bd549f0ba00f25a';
    const secretHashConfirmed = '4a8c7c8c3e7a1aee998eb66b1426c19999124452e04dc9009781db1acfe54c83';


    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.confirmSwap);
        // display the current contract address for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);

        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(sender.sk);

        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
    });

    describe("%confirmSwap", () => {

            it("should be callable by initiator of swap", async () => {
               const operationPromise = helpers.tzip7.confirmSwap(secretHashUnconfirmed);
               await expect(operationPromise).to.be.eventually.fulfilled;
            });

            it('should change the confirmed property to true in storage', async () => {
                const secretHash = secretHashUnconfirmed;
                await helpers.tzip7.confirmSwap(secretHash);
                const swap = await helpers.tzip7.getSwap(secretHash);
                expect(swap.confirmed).to.be.true;
            });

            it('should not change the storage for an already confirmed swap', async () => {
                const secretHash = secretHashConfirmed;
                await helpers.tzip7.confirmSwap(secretHash);
                const swap = await helpers.tzip7.getSwap(secretHash);
                expect(swap.confirmed).to.be.true;
            });

            it('should fail for the recipient to confirm', async () => {
                const operationPromise = _taquitoHelpers.signAs(recipient.sk, async () => {
                    await helpers.tzip7.confirmSwap(secretHashUnconfirmed);
                });
                
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.noPermission);
            });

            it('should fail for a third party', async () => {
                const operationPromise = _taquitoHelpers.signAs(thirdParty.sk, async () => {
                    await helpers.tzip7.confirmSwap(secretHashUnconfirmed);
                });
                
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.noPermission);
            });
            
            it('should fail for a non-existing swap', async () => {
                const operationPromise = helpers.tzip7.confirmSwap(helpers.tzip7.randomHash());

                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.swapLockDoesNotExist);
            });
    });
});
