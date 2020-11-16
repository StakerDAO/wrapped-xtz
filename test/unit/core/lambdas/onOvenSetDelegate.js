const { expect } = require('chai').use(require('chai-as-promised'));
const before = require("../before");

const _coreInitialStorage = require('../../../../migrations/initialStorage/core');
const { TezosOperationError } = require('@taquito/taquito');
const { contractErrors } = require('../../../../helpers/constants');
const { alice, chuck } = require('../../../../scripts/sandbox/accounts');
const testPackValue = require("../../../../scripts/lambdaCompiler/testPackValue");

contract('core', () => {
    describe('onOvenSetDelegate', () => {
        let helpers = {};

        beforeEach(async () => {
            helpers = {}
            await before({
                core: _coreInitialStorage.test.onOvenSetDelegate()
            }, helpers)
        });

        it('should not be callable with xtzAmount > 0mutez', async () => {
            const operationPromise = helpers.core.onOvenSetDelegate(
                alice.pkh, // ovenOwnerAddress
                {
                    amount: 1 // mutez
                }
            );
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.amountNotZero)
        });

        it('should be callable with xtzAmount = 0mutez', async () => {
            const operationPromise = helpers.core.onOvenSetDelegate(
                alice.pkh,
                {
                    amount: 0
                }
            );
            
            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        it('should not be callable by anyone other than oven owner', async () => {
            const operationPromise = helpers.core.onOvenSetDelegate(
                chuck.pkh,
                {
                    amount: 0
                }
            );
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.notAnOvenOwner)
        });

        it('should not emit any operations', async () => {
            const operation = await helpers.core.onOvenSetDelegate(
                alice.pkh // without sendParams amount is 0
            );
            const internalOperationResults = operation.results[0].metadata.internal_operation_results;

            expect(internalOperationResults).to.be.undefined
        });
    });
});