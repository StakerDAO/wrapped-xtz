const { expect } = require('chai').use(require('chai-as-promised'));
const before = require("../before");

const _coreInitialStorage = require('../../../../migrations/initialStorage/core');
const _tzip7InitialStorage = require('../../../../migrations/initialStorage/tzip-7');
const { TezosOperationError, Tezos } = require('@taquito/taquito');
const { contractErrors } = require('../../../../helpers/constants');
const { alice, bob, chuck, carol } = require('../../../../scripts/sandbox/accounts');
const testPackValue = require("../../../../scripts/lambdaCompiler/testPackValue");

contract('core', () => {
    describe('onOvenWithdrawalRequested', () => {
        let helpers = {};
        let wXTZBalance;

        beforeEach(async () => {
            helpers = {}
            await before({
                tzip7: _tzip7InitialStorage.withBalances,
                core: _coreInitialStorage.test.withdraw
            }, helpers)
            
            wXTZBalance = await _tzip7InitialStorage.withBalances.token.ledger.get(alice.pkh);
        });

        it('should not be callable with xtzAmount > 0mutez', async () => {
            const operationPromise = helpers.core.withdraw(
                wXTZBalance, // amount
                alice.pkh, // mock here the sender of the operation
                {
                    amount: 1 // mutez
                }
            );
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.amountNotZero)
        });

        it('should be callable with xtzAmount = 0mutez', async () => {
            const operationPromise = helpers.core.withdraw(
                wXTZBalance,
                alice.pkh,
                {
                    amount: 0 // mutez
                }
            );
            
            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        it('should not be callable by anyone other than oven owner', async () => {
            const operationPromise = helpers.core.withdraw(
                wXTZBalance, 
                chuck.pkh, // mock here the sender of the operation
                {
                    amount: 0
                }
            );
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.notAnOvenOwner)
        });

        describe('effects of onOvenWithdrawalRequested', () => {
            let operation;
            let wXTZBalance;

            beforeEach(async () => {
                wXTZBalance = await _tzip7InitialStorage.withBalances.token.ledger.get(alice.pkh);
                operation = await helpers.core.withdraw(
                    wXTZBalance, // wXTZ
                    alice.pkh, // mock here the sender of the operation
                    {
                        amount: 0 // mutez
                    }
                );
            });

            it('should not send any tez', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                const firstInternalOperationResult = internalOperationResults[0];
                expect(firstInternalOperationResult).to.deep.contain({
                    amount: '0',
                    destination: helpers.tzip7.instance.address,
                });
            });

            it('should emit a burn operation', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                const firstInternalOperationResult = internalOperationResults[0];
                
                expect(firstInternalOperationResult.parameters).to.deep.contain({
                    entrypoint: 'burn',
                });

                const bytes = testPackValue(`{("${alice.pkh}": address)}`);
                expect(bytes).includes(firstInternalOperationResult.parameters.value.args[0].bytes);
                
                expect(firstInternalOperationResult.parameters.value.args[1]).to.deep.contain({
                    int: `${wXTZBalance}`
                });
            });
        });
    });
});