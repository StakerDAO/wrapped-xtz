const { contractErrors, rpcErrors } = require("../../../helpers/constants");
const _coreHelpers = require('../../helpers/core');
const _taquitoHelpers = require('../../helpers/taquito');
const _coreInitialStorage = require('../../../migrations/initialStorage/core');
const { alice, bob, chuck, carol } = require('../../../scripts/sandbox/accounts');
const { TezosOperationError } = require("@taquito/taquito");
const { expect } = require('chai').use(require('chai-as-promised'));
const _tzip7Helpers = require('../../helpers/tzip-7');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const testPackValue = require("../../../scripts/lambdaCompiler/testPackValue");

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
            null, // delegate, baker
            alice.pkh, // owner
        );

        helpers = { coreHelpers, tzip7Helpers, ovenHelpers };
    });

    describe('default entrypoint', () => {

        describe('effects of sending tez to default', () => {
            let amountTez = 100;
            let amountMutez = amountTez * 1000000;    
        
            let operation;
            let balanceBefore = {};
            
            beforeEach(async () => {
                balanceBefore.alice = await _taquitoHelpers.getXTZBalance(alice.pkh);
                balanceBefore.oven = await _taquitoHelpers.getXTZBalance(helpers.ovenHelpers.instance.address);
                operation = await _taquitoHelpers.transfer(
                    helpers.ovenHelpers.instance.address,
                    amountMutez
                );
            });

            it("should increase oven's balance", async () => {
                let balanceAfter = {};
                balanceAfter.alice = await _taquitoHelpers.getXTZBalance(alice.pkh);
                balanceAfter.oven = await _taquitoHelpers.getXTZBalance(helpers.ovenHelpers.instance.address);
                
                // TODO add fees to calculation
                //expect(balanceAfter.alice).to.equal(balanceBefore.alice - amountMutez - fees);
                expect(balanceAfter.oven).to.equal(balanceBefore.oven + amountMutez);
            });

            it('should invoke core%onOvenDepositReceived', async () => {
                const firstInternalOperationResult = operation.results[0].metadata.internal_operation_results[0];

                expect(firstInternalOperationResult.parameters.value.args[0]).to.deep.contain({
                    string: 'onOvenDepositReceived'
                });
            });

            it('should forward tez to core', async () => {
                const firstInternalOperationResult = operation.results[0].metadata.internal_operation_results[0];
        
                expect(firstInternalOperationResult).to.deep.contain({
                    amount: `${amountMutez}`,
                    destination: helpers.coreHelpers.instance.address,
                });
            });
        });
    });

    //TODO call oven by core contract
})