const { contractErrors, rpcErrors } = require("../../../helpers/constants");
const _coreHelpers = require('../../helpers/core');
const _taquitoHelpers = require('../../helpers/taquito');
const _coreInitialStorage = require('../../../migrations/initialStorage/core');
const { alice, bob, chuck, carol } = require('../../../scripts/sandbox/accounts');
const { TezosOperationError } = require("@taquito/taquito");
const { expect } = require('chai').use(require('chai-as-promised'));
const _tzip7Helpers = require('../../helpers/tzip-7');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');

contract('oven', () => {
    let helpers = {};

    beforeEach(async () => {
        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(alice.sk);

        let { tzip7Helpers, tzip7Address } = await _tzip7Helpers.originate(_tzip7InitialStorage.base);
        let { coreHelpers, coreAddress } = await _coreHelpers.originate(
            _coreInitialStorage.base(tzip7Address)
        );

        await tzip7Helpers.setAdministrator(coreAddress);

        let { ovenHelpers } = await coreHelpers.createOven(
            null, // delegate
            alice.pkh, // owner
        );

        helpers = { coreHelpers, tzip7Helpers, ovenHelpers };
    });

    describe('setDelegate with an implicit account', () => {
        const baker = bob.pkh;   

        it('should delegate to baker Bob', async () => {     
            // set new delegate        
            await expect(helpers.ovenHelpers.setDelegate(baker)).to.be.fulfilled;
            // get new delegate
            const newDelegate = await helpers.ovenHelpers.getDelegate();
            expect(newDelegate).to.equal(baker);
        });

        it('should remove delegate', async () => {
            // set new delegate
            await expect(helpers.ovenHelpers.setDelegate(baker)).to.be.fulfilled;
            // remove delegation
            await helpers.ovenHelpers.setDelegate(null);
            // throws 404 error code if no delegate is set
            await expect(helpers.ovenHelpers.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);
        });

        describe('effects of setting delegate for oven contract', () => {
            let operation;
            
            beforeEach(async () => {
                // set delegate
                operation = await helpers.ovenHelpers.setDelegate(baker);
            });

            it('should invoke core%onOvenSetDelegate', async () => {    
                const internalOperationResults = operation.results[0].metadata.internal_operation_results; 
                const secondInternalOperationResult = internalOperationResults[0];
                
                expect(secondInternalOperationResult).to.deep.contain({
                    kind: 'transaction',
                    amount: '0',
                    destination: helpers.coreHelpers.instance.address,
                });
        
                expect(secondInternalOperationResult.parameters.value.args[0]).to.deep.contain({
                    string: 'onOvenSetDelegate'
                });
            });

            it('should send delegation operation', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results; 
                const secondInternalOperationResult = internalOperationResults[1]

                expect(secondInternalOperationResult).to.deep.contain({
                    kind: 'delegation',
                    delegate: `${baker}`
                });
            });
        });
    });

    describe('setdelegate with an originated account', () => {
        
        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);
    
            let { tzip7Helpers, tzip7Address } = await _tzip7Helpers.originate(_tzip7InitialStorage.base);
            let { coreHelpers, coreAddress } = await _coreHelpers.originate(
                _coreInitialStorage.base(tzip7Address)
            );

            await tzip7Helpers.setAdministrator(coreAddress);
            
            const brokenManagerContract = true;
            let { managerHelpers, managerAddress } = await _managerHelpers.originate(brokenManagerContract);
            
            let { ovenHelpers } = await coreHelpers.createOven(
                null, // delegate
                managerAddress, // owner
                {
                    amount: amountMutez
                }
            );
    
            helpers = { coreHelpers, ovenHelpers, managerHelpers };
        });

        const baker = bob.pkh;   

        it('should delegate to baker Bob', async () => {     
            const ovenAddress = helpers.ovenHelpers.instance.address;
            // set new delegate        
            await expect(helpers.managerHelpers.setDelegate(baker, ovenAddress)).to.be.fulfilled;
            // get new delegate
            const newDelegate = await helpers.ovenHelpers.getDelegate();
            expect(newDelegate).to.equal(baker);
        });

        it('should remove delegate', async () => {
            const ovenAddress = helpers.ovenHelpers.instance.address;
            // set new delegate
            await expect(helpers.managerHelpers.setDelegate(baker, ovenAddress)).to.be.fulfilled;
            // remove delegation
            await helpers.managerHelpers.setDelegate(null, ovenAddress);
            // throws 404 error code if no delegate is set
            await expect(helpers.ovenHelpers.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);
        });

        describe('effects of setting delegate for oven contract', () => {
            let operation;
            
            beforeEach(async () => {
                const ovenAddress = helpers.ovenHelpers.instance.address;
                // set delegate
                operation = await helpers.managerHelpers.setDelegate(baker, ovenAddress);
            });

            it('should invoke core%onOvenSetDelegate', async () => {    
                const internalOperationResults = operation.results[0].metadata.internal_operation_results; 
                const secondInternalOperationResult = internalOperationResults[1];
                
                expect(secondInternalOperationResult).to.deep.contain({
                    kind: 'transaction',
                    amount: '0',
                    destination: helpers.coreHelpers.instance.address,
                });
        
                expect(secondInternalOperationResult.parameters.value.args[0]).to.deep.contain({
                    string: 'onOvenSetDelegate'
                });
            });

            it('should send delegation operation', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results; 
                const thirdInternalOperationResult = internalOperationResults[2]

                expect(thirdInternalOperationResult).to.deep.contain({
                    kind: 'delegation',
                    delegate: `${baker}`
                });
            });
        });
    });
});