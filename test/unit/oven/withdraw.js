const { contractErrors } = require("../../../helpers/constants");
const { alice } = require('../../../scripts/sandbox/accounts');
const { TezosOperationError } = require("@taquito/taquito");
const { expect } = require('chai').use(require('chai-as-promised'));
const _managerHelpers = require('../../helpers/manager');
const _taquitoHelpers = require('../../helpers/taquito');
const _ovenHelpers = require('../../helpers/oven');
const before = require('./before');


contract('oven %withdraw entrypoint', () => {
    let helpers = {};    
    let amountTez = 100;
    let amountMutez = amountTez * 1000000;

    describe('withdraw with an implicit account', () => {
        
        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            helpers = await before(
                alice.pkh, //owner
                amountMutez,
                helpers
            );
        });
    
        it('should not be invocable when the operation carries tez', async () => {
            const sendParams = { 
                amount: 10 // mutez
            }; 
            await expect(helpers.oven.withdraw(amountMutez, sendParams))
                .to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.amountNotZero);
        });

        describe('effects of withdrawing from the oven contract', () => {
            let operation;

            beforeEach(async () => {
                operation = await helpers.oven.withdraw(amountMutez);
            });

            it('should invoke core%onOvenWithdrawalRequested', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                const firstInternalOperationResult = internalOperationResults[0];
        
                // not sending tez from oven to core
                expect(firstInternalOperationResult).to.deep.contain({
                    amount: '0',
                    destination: helpers.core.instance.address,
                });

                expect(firstInternalOperationResult.parameters.value.args[0]).to.deep.contain({
                    string: 'onOvenWithdrawalRequested'
                });
            });

            it('should send tez to oven owner', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                const secondInternalOperationResult = internalOperationResults[1];

                expect(secondInternalOperationResult).to.deep.contain({
                    amount: `${amountMutez}`,
                    destination: alice.pkh // ovenOwner
                });
            });
        });
    });

    describe('withdraw with an originated account', () => {

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            let { managerHelpers, managerAddress } = await _managerHelpers.originate();

            helpers = await before(
                managerAddress, // owner
                amountMutez, 
                helpers
            );
            
            helpers.manager = managerHelpers;
        });

        describe('effects of withdrawing from the oven contract', () => {
            let operation;

            beforeEach(async () => {
                operation = await helpers.manager.withdraw(amountMutez, helpers.oven.instance.address);
            });

            it('should invoke core%onOvenWithdrawalRequested', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                // first operation goes from manager contract to oven
                // second operation from oven to core
                const secondInternalOperationResult = internalOperationResults[1];
        
                // not sending any tez from oven to core
                expect(secondInternalOperationResult).to.deep.contain({
                    amount: '0',
                    destination: helpers.core.instance.address,
                });

                expect(secondInternalOperationResult.parameters.value.args[0]).to.deep.contain({
                    string: 'onOvenWithdrawalRequested'
                });
            });

            it('should send tez to oven owner', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                const thirdInternalOperationResult = internalOperationResults[2];

                expect(thirdInternalOperationResult).to.deep.contain({
                    amount: `${amountMutez}`,
                    destination: helpers.manager.instance.address // ovenOwner
                });
            });
        });
    });

    describe('withdraw with an originated account that has no default entrypoint', () => {
        
        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            const brokenManager = true;
            let { managerHelpers, managerAddress } = await _managerHelpers.originate(brokenManager);
            helpers = await before(
                managerAddress, 
                amountMutez,
                helpers
            );

            helpers.manager = managerHelpers;
        });

        it('should fail to withdraw to an originated account without default entrypoint', async () => {
            await expect(helpers.manager.withdraw(amountMutez, helpers.oven.instance.address))
                .to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.ovenOwnerDoesNotAcceptDeposits);            
        });
    });

    describe('scenario where the core is broken', () => {

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            const initalStorage = alice.pkh; // alice mocks the core contract
            const { ovenHelpers } = await _ovenHelpers.originate(initalStorage);
            helpers.oven = ovenHelpers;
        });

        it('should fail for an oven linked to a core without a %runEntrypointLambda', async () => {
            const operationPromise = helpers.oven.withdraw(100);

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.coreContractEntrypointTypeMissmatch);    
        });
    });
});
