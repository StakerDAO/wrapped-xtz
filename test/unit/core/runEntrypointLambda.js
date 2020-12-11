const { expect } = require('chai').use(require('chai-as-promised'));
const before = require('./before');
const testPackValue = require("../../../scripts/lambdaCompiler/testPackValue");

const _coreInitialStorage = require('../../../migrations/initialStorage/core');
const { contractErrors } = require("../../../helpers/constants");
const { TezosOperationError } = require("@taquito/taquito");

const { alice } = require('../../../scripts/sandbox/accounts');

contract('core', () => {
    describe('runEntrypointLambda', () => {
        let helpers = {};

        beforeEach(async () => await before({
            core: _coreInitialStorage.test.runEntrypointLambda()
        }, helpers));

        it('should not run non existing lambdas', async () => {
            const operationPromise = helpers.core.runEntrypointLambda(
                'this-is-not-a-lambda',
                '()' // pass a mock unit parameter since at least something needs to be packed for the call
            );

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.lambdaNotFound);
        });

        it('should not run existing lambdas, that have the wrong type signature', async () => {
            const operationPromise = helpers.core.runEntrypointLambda(
                'nonEntrypointLambda',
                '()'
            );
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.lambdaNotAnEntrypoint);
        });

        it('should run existing lambdas, that have the correct type signature', async () => {
            const operationPromise = helpers.core.runEntrypointLambda(
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
                operation = await helpers.core.runEntrypointLambda(
                    'simpleEntrypointLambda',
                    parameter,
                    { amount }
                );
            });

            it('should propagate storage updates from the executed lambda', async () => {    
                const newStorageValue = await helpers.core.getArbitraryValue('simpleEntrypointLambda');
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
