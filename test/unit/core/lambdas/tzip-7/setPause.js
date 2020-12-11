const { expect } = require('chai').use(require('chai-as-promised'));
const before = require("../../before");

const _tzip7InitialStorage = require('../../../../../migrations/initialStorage/tzip-7');
const _coreInitialStorage = require('../../../../../migrations/initialStorage/core');

const { alice, bob } = require('../../../../../scripts/sandbox/accounts');
const { contractErrors } = require('../../../../../helpers/constants');
const _taquitoHelpers = require('../../../../helpers/taquito');
const testPackValue = require('../../../../../scripts/lambdaCompiler/testPackValue');

contract('core', () => {

    let helpers = {};
    let newPause = false;

    beforeEach(async () => {
        helpers = {};
        await before({
            tzip7: _tzip7InitialStorage.test.paused,
            core: _coreInitialStorage.base
        }, helpers)
    });

    describe('setPause', () => {
        it('should not be callable by other address than the admin', async () => {
            const operationPromise = _taquitoHelpers.signAs(bob.sk, async () => {
                return helpers.core.setPause(newPause) 
            });

            await expect(operationPromise).to.be.eventually.rejected
                .and.have.property('message', contractErrors.core.senderIsNotAdmin);
        });

        it('should be callable by the core admin', async () => {
            const operationPromise = _taquitoHelpers.signAs(alice.sk, async () => {
                return helpers.core.setPause(newPause) 
            });

            await expect(operationPromise).to.be.eventually.fulfilled
        });

        describe('emitted operations', () => {
            let internalOperationResults;
            let firstOperation;
            beforeEach(async () => {
                const operation = await helpers.core.setPause(newPause);
                internalOperationResults = operation.results[0].metadata.internal_operation_results;
                firstOperation = internalOperationResults[0];
            });

            it('should emit one operation', async () => {
                expect(internalOperationResults.length).to.be.equal(1);
            });

            it('should emit a setPause operation on the tzip-7 token contract', async () => {
                expect(firstOperation.destination).to.be.equal(helpers.tzip7.instance.address);
                expect(firstOperation.parameters.entrypoint).to.be.equal('setPause');
                /**
                 * .contain is used instead of .equal since testPackValue 
                 * also produces bytes for the type of the given value
                 */
                expect(firstOperation.parameters.value.prim.toLowerCase()).to.equal(`${newPause}`);
            });
        });
    });
});
