const { contractErrors, rpcErrors } = require("../../helpers/constants");
const _coreHelpers = require('../helpers/core');
const _taquitoHelpers = require('../helpers/taquito');
const _coreInitialStorage = require('../../migrations/initialStorage/core');
const { alice, bob, chuck, carol } = require('../../scripts/sandbox/accounts');
const { TezosOperationError } = require("@taquito/taquito");
const { expect } = require('chai').use(require('chai-as-promised'));
const _tzip7Helpers = require('../helpers/tzip-7');
const _tzip7InitialStorage = require('../../migrations/initialStorage/tzip-7');
const testPackValue = require("../../scripts/lambdaCompiler/testPackValue");
const { Tezos } = require('@taquito/taquito');

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

    describe('default', () => {
        it('should be invocable by oven owner', async () => {        
            let operationPromise = helpers.ovenHelpers.default(0);
            await expect(operationPromise).to.be.fulfilled;
        });

        it('should be invocable by a 3rd party', async () => {
            await _taquitoHelpers.setSigner(bob.sk);
            
            let operationPromise = helpers.ovenHelpers.default(0);
            await expect(operationPromise).to.be.fulfilled;
        });

        describe('effects of sending tez to default', () => {
            let amountTez = 100;
            let amountMutez = amountTez * 1000000;
            let operation;
            let balanceBefore = {};
            
            beforeEach(async () => {
                balanceBefore.alice = await _taquitoHelpers.getXTZBalance(alice.pkh);
                balanceBefore.oven = await _taquitoHelpers.getXTZBalance(helpers.ovenHelpers.instance.address);
                operation = await helpers.ovenHelpers.default(amountMutez);
            });

            it("should increase oven's balance", async () => {
                let balanceAfter = {};
                balanceAfter.alice = await _taquitoHelpers.getXTZBalance(alice.pkh);
                balanceAfter.oven = await _taquitoHelpers.getXTZBalance(helpers.ovenHelpers.instance.address);
                
                // TODO add fees to calculation
                //expect(balanceAfter.alice).to.equal(balanceBefore.alice - amountMutez - fees);
                expect(balanceAfter.oven).to.equal(balanceBefore.oven + amountMutez);
            });

            it('should forward tez to core', async () => {
                const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                // there are 3 internal operations, first one going to core
                const firstInternalOperationResult = internalOperationResults[0];
        
                expect(firstInternalOperationResult).to.deep.contain({
                    amount: `${amountMutez}`,
                    destination: helpers.coreHelpers.instance.address,
                });
            });
        });

        describe('withdraw', () => {
            let amountTez = 100;
            let amountMutez = amountTez * 1000000;
            beforeEach(async () => {
                await helpers.ovenHelpers.default(amountMutez);
            });
            
            it("should not be invocable by 3rd party", async () => {
                await _taquitoHelpers.setSigner(carol.sk);
                
                const operationPromise = helpers.ovenHelpers.withdraw(100);
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.core.notAnOvenOwner);
            });

            it('should be invocable by oven owner', async () => {
                const operationPromise = helpers.ovenHelpers.withdraw(100);
                await expect(operationPromise).to.be.fulfilled;
            });

            it('should not be invocable when it carries tez', async () => {
                const ovenInstance = await Tezos.contract.at(helpers.ovenHelpers.instance.address);
                await expect(ovenInstance.methods.withdraw(100).send({ amount: 10 })).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.core.amountNotZero);
            });

            describe('effects of withdrawing from the oven contract', () => {
                let amountTez = 100;
                let amountMutez = amountTez * 1000000;
                let operation;

                beforeEach(async () => {
                    // deposit to oven
                    await helpers.ovenHelpers.default(amountMutez);
                    operation = await helpers.ovenHelpers.withdraw(amountMutez);
                });

                it('should send withdraw request to core', async () => {
                    const internalOperationResults = operation.results[0].metadata.internal_operation_results;
                    const firstInternalOperationResult = internalOperationResults[0];
                    const secondInternalOperationResult = internalOperationResults[1];
            
                    // not sending tez from oven to core
                    expect(firstInternalOperationResult).to.deep.contain({
                        amount: '0',
                        destination: helpers.coreHelpers.instance.address,
                    });
                    
                    // sending tez to ovenOwner 
                    expect(secondInternalOperationResult).to.deep.contain({
                        amount: `${amountMutez}`,
                        destination: alice.pkh // ovenOwner
                    });
                });
            });
        });

        describe('setDelegate', () => {
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

            it('should not allow a 3rd party to change the delegation', async () => {
                await _taquitoHelpers.setSigner(chuck.sk);
                await expect(helpers.ovenHelpers.setDelegate(baker)).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.core.notAnOvenOwner);
            });

            it('should fail when tez is sent with operation', async () => {
                const ovenInstance = await Tezos.contract.at(helpers.ovenHelpers.instance.address);
                await expect(ovenInstance.methods.setDelegate(baker).send({ amount: 10 })).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.core.amountNotZero);
            });

            describe('effects of setting delegate from oven contract', () => {
                let operation;
                
                // before does not work here
                beforeEach(async () => {
                    // set delegate
                    operation = await helpers.ovenHelpers.setDelegate(baker);
                });

                it('should request core and set delegate', async () => {    
                    const internalOperationResults = operation.results[0].metadata.internal_operation_results; 
                    const firstInternalOperationResult = internalOperationResults[0];
                    const secondInternalOperationResult = internalOperationResults[1]

                    expect(firstInternalOperationResult).to.deep.contain({
                        kind: 'transaction',
                        amount: '0',
                        destination: helpers.coreHelpers.instance.address,
                    });

                    expect(firstInternalOperationResult.parameters).to.deep.contain({
                        entrypoint: 'runEntrypointLambda',
                    });             

                    expect(secondInternalOperationResult).to.deep.contain({
                        kind: 'delegation',
                        delegate: `${baker}`
                    });
                });

                // consider checking effect of set delegate when tez is sent and rejected by core
            });
        });
    });

    //TODO call oven by core contract
})