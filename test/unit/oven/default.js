const _taquitoHelpers = require('../../helpers/taquito');
const { alice, chuck } = require('../../../scripts/sandbox/accounts');
const { expect } = require('chai').use(require('chai-as-promised'));
const _ovenHelpers = require('../../helpers/oven');
const { TezosOperationError } = require("@taquito/taquito");
const { contractErrors } = require("../../../helpers/constants");
const before = require('./before');

contract('oven %default entrypoint', () => {
    let helpers = {};
    let amountTez = 100;
    let amountMutez = amountTez * 1000000;    

    describe('scenario with a working core', () => {

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);
    
            helpers = await before(
                alice.pkh, //owner
                amountMutez,
                helpers
            );
        });
    
        describe('default entrypoint', () => {
    
            describe('effects of sending tez to default', () => {
                let operation;
                let balanceBefore = {};
                
                beforeEach(async () => {
                    balanceBefore.alice = await _taquitoHelpers.getXTZBalance(alice.pkh);
                    balanceBefore.oven = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
                    operation = await _taquitoHelpers.transfer(
                        helpers.oven.instance.address,
                        amountMutez
                    );
                });
    
                it("should increase oven's balance", async () => {
                    let balanceAfter = {};
                    balanceAfter.alice = await _taquitoHelpers.getXTZBalance(alice.pkh);
                    balanceAfter.oven = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
                    
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
                        destination: helpers.core.instance.address,
                    });
                });
            });
        });
    });

    describe('scenarios out of the ordinary to catch all cases and errors', () => {

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            const initalStorage = alice.pkh; // alice mocks the core contract
            const { ovenHelpers } = await _ovenHelpers.originate(initalStorage);
            helpers.oven = ovenHelpers;
        });

        it('should do nothing when core sends XTZ to oven', async () => {
            // signer is Alice, who is core address in this test
            const operationPromise = _taquitoHelpers.transfer(
                helpers.oven.instance.address,
                amountMutez
            );
            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        it('should fail for an oven linked to a core without a %runEntrypointLambda', async () => {
            await _taquitoHelpers.setSigner(chuck.sk); // need to switch signer who is different from core address
            const operationPromise = _taquitoHelpers.transfer(
                helpers.oven.instance.address,
                amountMutez
            );

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.coreContractEntrypointTypeMissmatch);    
        });
    });
});