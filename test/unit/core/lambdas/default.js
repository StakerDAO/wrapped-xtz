const { expect } = require('chai').use(require('chai-as-promised'));
const before = require("../before");

const _coreInitialStorage = require('../../../../migrations/initialStorage/core');
const { TezosOperationError, Tezos } = require('@taquito/taquito');
const { contractErrors } = require('../../../../helpers/constants');

contract('core', () => {
    describe('default', () => {

        let helpers = {};

        beforeEach(async () => await before({
            core: _coreInitialStorage.test.base()
        }, helpers));

        it('should not be callable with xtzAmount > 0mutez', async () => {
            const operationPromise = helpers.core.default({
                amount: 1
            });
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.amountNotZero)
        });

        it('should be callable with xtzAmount = 0mutez', async () => {
            const operationPromise = helpers.core.default({
                amount: 0
            });

            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        it('should emit no operations', async () => {
            const operation = await helpers.core.default({
                amount: 0
            });
            const internalOperationResults = operation.results[0].metadata.internal_operation_results;

            expect(internalOperationResults).to.be.undefined
        });

        // TODO: this most likely does not catch big_map updates
        it('should not apply any storage changes', async () => {
            const oldStorage = await Tezos.rpc.getStorage(helpers.core.instance.address)
            await helpers.core.default({
                amount: 0
            });
            const newStorage = await Tezos.rpc.getStorage(helpers.core.instance.address)
            
            expect(oldStorage).to.be.deep.equal(newStorage);
        })
    });
});