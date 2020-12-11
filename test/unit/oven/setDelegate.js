const { rpcErrors } = require("../../../helpers/constants");
const _taquitoHelpers = require('../../helpers/taquito');
const { alice, bob, chuck } = require('../../../scripts/sandbox/accounts');
const { expect } = require('chai').use(require('chai-as-promised'));
const _managerHelpers = require('../../helpers/manager');
const { TezosOperationError } = require("@taquito/taquito");
const { contractErrors } = require("../../../helpers/constants");
const _ovenHelpers = require('../../helpers/oven');
const before = require('./before');

contract('oven %setDelegate entrypoint', () => {
    let helpers = {};
    let amountTez = 100;
    let amountMutez = amountTez * 1000000;
    const baker = bob.pkh;

    describe('setDelegate with an implicit account', () => {
        
        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);
            
            helpers = await before(
                alice.pkh, //owner
                amountMutez,
                helpers
            );
        });

        it('should delegate to baker Bob', async () => {     
            // set new delegate        
            await expect(helpers.oven.setDelegate(baker)).to.be.fulfilled;
            // get new delegate
            const newDelegate = await helpers.oven.getDelegate();
            expect(newDelegate).to.equal(baker);
        });

        it('should remove delegate', async () => {
            // set new delegate
            await expect(helpers.oven.setDelegate(baker)).to.be.fulfilled;
            // remove delegation
            await helpers.oven.setDelegate(null);
            // throws 404 error code if no delegate is set
            await expect(helpers.oven.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);
        });

        describe('effects of setting delegate for oven contract', () => {
            let operation;
            
            beforeEach(async () => {
                // set delegate
                operation = await helpers.oven.setDelegate(baker);
            });

            it('should invoke core%onOvenSetDelegate', async () => {    
                const internalOperationResults = operation.results[0].metadata.internal_operation_results; 
                const secondInternalOperationResult = internalOperationResults[0];
                
                expect(secondInternalOperationResult).to.deep.contain({
                    kind: 'transaction',
                    amount: '0',
                    destination: helpers.core.instance.address,
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

    describe('setDelegate with an originated account', () => {
        
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

        it('should delegate to baker Bob', async () => {     
            const ovenAddress = helpers.oven.instance.address;
            // set new delegate        
            await expect(helpers.manager.setDelegate(baker, ovenAddress)).to.be.fulfilled;
            // get new delegate
            const newDelegate = await helpers.oven.getDelegate();
            expect(newDelegate).to.equal(baker);
        });

        it('should remove delegate', async () => {
            const ovenAddress = helpers.oven.instance.address;
            // set new delegate
            await expect(helpers.manager.setDelegate(baker, ovenAddress)).to.be.fulfilled;
            // remove delegation
            await helpers.manager.setDelegate(null, ovenAddress);
            // throws 404 error code if no delegate is set
            await expect(helpers.oven.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);
        });

        describe('effects of setting delegate for oven contract', () => {
            let operation;
            
            beforeEach(async () => {
                const ovenAddress = helpers.oven.instance.address;
                // set delegate
                operation = await helpers.manager.setDelegate(baker, ovenAddress);
            });

            it('should invoke core%onOvenSetDelegate', async () => {    
                const internalOperationResults = operation.results[0].metadata.internal_operation_results; 
                const secondInternalOperationResult = internalOperationResults[1];
                
                expect(secondInternalOperationResult).to.deep.contain({
                    kind: 'transaction',
                    amount: '0',
                    destination: helpers.core.instance.address,
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

    describe('scenario where the core is broken', () => {

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            const initalStorage = alice.pkh; // alice mocks the core contract
            const { ovenHelpers } = await _ovenHelpers.originate(initalStorage);
            helpers.oven = ovenHelpers;
        });

        it('should fail for an oven linked to a core without a %runEntrypointLambda', async () => {
            const operationPromise = helpers.oven.setDelegate(chuck.pkh);

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.coreContractEntrypointTypeMissmatch);    
        });
    });
});
