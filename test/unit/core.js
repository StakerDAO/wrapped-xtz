const { contractErrors } = require("../../helpers/constants");
const _coreHelpers = require('../helpers/core');
const _taquitoHelpers = require('../helpers/taquito');
const _coreInitialStorage = require('../../migrations/initialStorage/core');
const { alice } = require('../../scripts/sandbox/accounts');
const { TezosOperationError } = require("@taquito/taquito");
const { expect } = require('chai').use(require('chai-as-promised'));
const _tzip7Helpers = require('../helpers/tzip-7');
const _tzip7InitialStorage = require('../../migrations/initialStorage/tzip-7');
const testPackValue = require("../../scripts/lambdaCompiler/testPackValue");

contract('core', () => {
    describe('runEntrypointLambda', () => {
        let helpers = {};

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            let { tzip7Helpers } = await _tzip7Helpers.originate(_tzip7InitialStorage.base);
            let { coreHelpers } = await _coreHelpers.originate(_coreInitialStorage.test.runEntrypointLambda(
                tzip7Helpers.instance.address
            ));
            helpers = { coreHelpers, tzip7Helpers };
        });

        it('should not run non existing lambdas', async () => {
            const operationPromise = helpers.coreHelpers.runEntrypointLambda(
                'this-is-not-a-lambda',
                '()' // pass a mock unit parameter since at least something needs to be packed for the call
            );

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.errorLambdaNotFound);
        });

        it('should not run existing lambdas, that have the wrong type signature', async () => {
            const operationPromise = helpers.coreHelpers.runEntrypointLambda(
                'nonEntrypointLambda',
                '()'
            );
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.errorLambdaNotAnEntrypoint);
        });

        it('should run existing lambdas, that have the correct type signature', async () => {
            const operationPromise = helpers.coreHelpers.runEntrypointLambda(
                'default',
                '()'
            );
            await expect(operationPromise).to.be.fulfilled;
        });

        describe('effects of the executed lambdas', () => {
            
            let amount = 1000;
            let parameter = '10n';
            let operation;
            beforeEach(async () => {
                operation = await helpers.coreHelpers.runEntrypointLambda(
                    'simpleEntrypointLambda',
                    parameter,
                    { amount }
                );
            });

            it('should propagate storage updates from the executed lambda', async () => {    
                const newStorageValue = await helpers.coreHelpers.getArbitraryValue('simpleEntrypointLambda');
                expect(newStorageValue).to.be.equal(testPackValue(parameter));
            });

            it('should propagate operations from the executed lambda', async () => {    
                const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                const firstInternalOperationResult = internalOperationResults[0];

                expect(internalOperationResults.length).to.be.equal(1);
                expect(firstInternalOperationResult).to.deep.contain({
                    amount: `${amount}`, // needs to be string for the matcher
                    destination: alice.pkh
                });
            });
        });
    })
})