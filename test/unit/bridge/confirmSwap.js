const tzip7 = artifacts.require('tzip-7');
const { contractErrors } = require('./../../../helpers/constants');
const _cryptoHelpers = require('../../../helpers/crypto');
const _tzip7InitialStorage = require('./../../../migrations/initialStorage/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const _tzip7Helpers = require('../../helpers/tzip-7');
const accounts = require('./accounts');

const { expect } = require('chai').use(require('chai-as-promised'));
const { TezosOperationError } = require('@taquito/taquito');

contract('TZIP-7 with bridge', () => {
    let helpers = {};
    let secretHash;

    describe("%confirmSwap", () => {

        describe('for an unconfirmed swap', () => {

            beforeEach(async () => {
                secretHash = _cryptoHelpers.randomHash();
                // deploy TZIP-7 instance with specific storage
                const initialstorage = _tzip7InitialStorage.test.confirmSwap(secretHash, false); // unconfirmed
                tzip7Instance = await tzip7.new(initialstorage);
                // display the current contract address for debugging purposes
                console.log('Originated token contract at:', tzip7Instance.address);
        
                await _taquitoHelpers.initialize();
                await _taquitoHelpers.setSigner(accounts.sender.sk);
        
                helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
            });

            it("should be callable by initiator of swap", async () => {
                const operationPromise = await helpers.tzip7.confirmSwap(secretHash);
                //await expect(operationPromise).to.be.eventually.fulfilled;
            });
 
            it('should change the swap property confirmed to true in storage', async () => {
                await helpers.tzip7.confirmSwap(secretHash);
                const swap = await helpers.tzip7.getSwap(secretHash);
                expect(swap.confirmed).to.be.true;
            });

            it('should fail for the recipient to confirm', async () => {
                const operationPromise = _taquitoHelpers.signAs(accounts.recipient.sk, async () => {
                    await helpers.tzip7.confirmSwap(secretHash);
                });
                
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.senderIsNotTheInitiator);
            });

            it('should fail for a third party', async () => {
                const operationPromise = _taquitoHelpers.signAs(accounts.thirdParty.sk, async () => {
                    await helpers.tzip7.confirmSwap(secretHash);
                });
                
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.senderIsNotTheInitiator);
            });
            
            it('should fail for a non-existing swap', async () => {
                const operationPromise = helpers.tzip7.confirmSwap(_cryptoHelpers.randomHash());

                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.swapLockDoesNotExist);
            });
        });

        describe('for a confirmed swap', () => {

            beforeEach(async () => {
                secretHash = _cryptoHelpers.randomHash();
                // deploy TZIP-7 instance with specific storage
                const initialstorage = _tzip7InitialStorage.test.confirmSwap(secretHash, true); // confirmed
                tzip7Instance = await tzip7.new(initialstorage);
                // display the current contract address for debugging purposes
                console.log('Originated token contract at:', tzip7Instance.address);

                await _taquitoHelpers.initialize();
                await _taquitoHelpers.setSigner(accounts.sender.sk);

                helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
            });
        
            it('should fail for an already confirmed swap', async () => {
                const operationPromise = helpers.tzip7.confirmSwap(secretHash);
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.swapIsAlreadyConfirmed);
            });
        });
    });
});