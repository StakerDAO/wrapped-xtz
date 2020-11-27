const { expect } = require('chai').use(require('chai-as-promised'));
const before = require("../before");

const _tzip7InitialStorage = require('../../../../migrations/initialStorage/tzip-7');
const _coreInitialStorage = require('../../../../migrations/initialStorage/core');

const _taquitoHelpers = require('./../../../helpers/taquito');
const _managerHelpers = require('./../../../helpers/manager');
const { alice, carol, chuck } = require('../../../../scripts/sandbox/accounts');
const { TezosOperationError } = require('@taquito/taquito');

const { contractErrors } = require('../../../../helpers/constants');

contract('core', () => {

    let helpers = {};

    const defaultAmount = 1 * 1000000;
    const onOvenDepositReceived = async (sendParams) => {
        return await helpers.core.onOvenDepositReceived({
            amount: defaultAmount,
            mutez: true,
            ...sendParams
        });
    };

    describe('onOvenDepositReceived', () => {

        beforeEach(async () => {
            helpers = {};
            await before({
                tzip7: _tzip7InitialStorage.base,
                core: _coreInitialStorage.test.onOvenDepositReceived([])
            }, helpers);
        });

        describe('access control', () => {

            it('should not be callable by an address that is not a trusted oven', async () => {
                const promise = _taquitoHelpers.signAs(chuck.sk, async() => {
                    return await onOvenDepositReceived();
                });
                await expect(promise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.core.ovenNotTrusted)
            });
    
            it('should only be callable directly by a trusted oven', async () => {
                // default signer alice is a trusted oven per the initial state
                const promise = onOvenDepositReceived();
                await expect(promise).to.be.eventually.fulfilled;
            });

        });

        describe('emitted operations', () => {

            let internalOperationResults;
            beforeEach(async () => {
                const operation = await onOvenDepositReceived();
                internalOperationResults = operation.results[0].metadata.internal_operation_results;
            });

            it('should emit two operations', () => {
                expect(internalOperationResults.length).to.be.equal(2);
            });

            it('should emit an XTZ return operation', async () => {
                const xtzReturnOperation = internalOperationResults[0];
                expect(xtzReturnOperation.kind).to.be.equal('transaction');
                expect(xtzReturnOperation.amount).to.be.equal(`${defaultAmount}`);
                // alice is the owner & the trusted oven at the same time, so the funds are returned to her
                expect(xtzReturnOperation.destination).to.be.equal(alice.pkh);
            });

            it('should emit an wXTZ mint operation', async () => {
                const wXTZMintOperation = internalOperationResults[1];
                expect(wXTZMintOperation.kind).to.be.equal('transaction');
                expect(wXTZMintOperation.amount).to.be.equal(`0`);
                // alice is the owner & the trusted oven at the same time, so the funds are returned to her
                expect(wXTZMintOperation.destination).to.be.equal(helpers.tzip7.instance.address);
                expect(wXTZMintOperation.parameters.entrypoint).to.be.equal('mint');
                expect(wXTZMintOperation.parameters.value.args[1].int).to.be.equal(`${defaultAmount}`)
            });
        })
        
    });

    describe('onOvenDepositReceived', () => {

        beforeEach(async () => {
            // taquito initialization here is duplicate
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);
            helpers = {};

            /**
             * Manager will act as a mock vault, without %default
             */
            helpers.brokenManagerHelpers = await (async () => {
                let { managerHelpers } = await _managerHelpers.originate(true);
                return managerHelpers
            })();

            helpers.managerHelpers = await (async () => {
                let { managerHelpers } = await _managerHelpers.originate(false);
                return managerHelpers
            })();

            await before({
                tzip7: _tzip7InitialStorage.base,
                core: _coreInitialStorage.test.onOvenDepositReceived([
                    {
                        oven: helpers.brokenManagerHelpers.instance.address,
                        owner: chuck.pkh
                    },
                    {
                        oven: helpers.managerHelpers.instance.address,
                        owner: chuck.pkh
                    }
                ])     
            }, helpers);
         });

        describe('return of the deposited XTZ back to the oven', () => {

            it('should fail if the oven does not accept return of deposits via %default', async () => {
                const operation = helpers.brokenManagerHelpers.deposit(
                    helpers.core.instance.address, 
                    {
                        amount: 1 * 1000000,
                        mutez: true
                    }
                );

                await expect(operation).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.core.ovenMissingDefaultEntrypoint);
            });

            // to maintain separation of concerns real wXTZ Oven code is not used for testing here
            it('should not fail if the oven does accept return of deposits via %default', async () => {
                const operation = helpers.managerHelpers.deposit(
                    helpers.core.instance.address, 
                    {
                        amount: 1 * 1000000,
                        mutez: true
                    }
                );
                await expect(operation).to.be.eventually.fulfilled;
            });

        });
    });

    describe('onOvenDepositReceived with broken TZIP-7', () => {
        
        beforeEach(async () => {
            helpers = {};
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);
            
            // manager contract will also act as oven and needs to have a %default entrypoint
            const { managerAddress, managerHelpers } = await _managerHelpers.originate();
            helpers.manager = managerHelpers;
            
            // manager contract acts as broken TZIP-7 that has no mint entrypoint implemented
            const brokenTzip7Address = managerAddress;
            await before({
                core: _coreInitialStorage.test.onOvenDepositReceived([
                    {
                        oven: helpers.manager.instance.address,
                        owner: alice.pkh
                    }
                ]) (brokenTzip7Address)     
            }, helpers);
        });
        
        it('should fail for minting tokens', async () => {
            const operationPromise = helpers.manager.deposit(
                helpers.core.instance.address, // core address
                {
                    amount: 100,
                    mutez: true
                }
            );

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.wXTZTokenContractWrongType);   
        });
    });

    describe('onOvenDepositReceived with wrong arbitrary value in storage', () => {
        helpers = {};

        beforeEach(async () => await before({
            core: _coreInitialStorage.test.wrongArbitraryValue()    
        }, helpers));
        
        it('should fail for burning tokens', async () => {       
            const operationPromise = onOvenDepositReceived(); 

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.arbitraryValueWrongType); 
        });
    });
});