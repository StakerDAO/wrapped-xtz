const { expect } = require('chai').use(require('chai-as-promised'));
const before = require("../before");

const { alice, bob, carol } = require('../../../../scripts/sandbox/accounts');
const _coreInitialStorage = require('../../../../migrations/initialStorage/core');
const _tzip7InitialStorage = require('../../../../migrations/initialStorage/tzip-7');
const { TezosOperationError, Tezos } = require('@taquito/taquito');
const { contractErrors, rpcErrors } = require('../../../../helpers/constants');
const _taquitoHelpers = require('../../../helpers/taquito');
const generateAddress = require('../../../../helpers/generateAddress');
const testPackValue = require('../../../../scripts/lambdaCompiler/testPackValue');
const loadLambdaArtifact = require('../../../../scripts/lambdaCompiler/loadLambdaArtifact');

contract('core', () => {

    describe('createOven', () => {
        let helpers = {};

        beforeEach(async () => {
            helpers = {}
            await before({
                tzip7: _tzip7InitialStorage.base,
                core: _coreInitialStorage.test.createOven
            }, helpers)
        });

        const defaultDelegate = bob.pkh;
        const defaultOwner = alice.pkh;
        const defaultAmount = 1 * 1000000; // 1tez
        const createOven = async (
            delegateKeyHash = defaultDelegate, 
            ownerAddress = defaultOwner, 
            sendParams = {
                amount: defaultAmount
            }
        ) => {
            return await helpers.core.createOven(
                delegateKeyHash,
                ownerAddress,
                sendParams
            );
        };

        it('should be callable by anyone without restrictions', async () => {
            const operationPromiseAlice = _taquitoHelpers.signAs(alice.sk, async () => {
                return await createOven(bob.pkh, alice.pkh);
            });

            await expect(operationPromiseAlice).to.be.eventually.fulfilled;

            const operationPromiseCarol = _taquitoHelpers.signAs(carol.sk, async () => {
                return await createOven(bob.pkh, carol.pkh);
            });

            await expect(operationPromiseCarol).to.be.eventually.fulfilled;
        });

        describe('delegate selection', () => {
            it('should be possible to delegate to the oven owner him/herself', async () => {
                const operationPromiseBob = _taquitoHelpers.signAs(bob.sk, async () => {
                    return await createOven(bob.pkh, bob.pkh);
                });
    
                await expect(operationPromiseBob).to.be.eventually.fulfilled;
            });

            it('should be possible to choose no delegate', async () => {
                const operationPromise = createOven(null);
                await expect(operationPromise).to.be.eventually.fulfilled;
            });

            it('should not be possible to choose an unregistred delegate for the oven', async () => {
                const notADelegate = generateAddress();
                const operationPromise = createOven(notADelegate);

                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', rpcErrors.proto.unregistredDelegate);
            });

            it('should be possible to choose any registred delegate', async () => {
                const operationPromiseAlice = createOven(alice.pkh);
                await expect(operationPromiseAlice).to.be.eventually.fulfilled;

                const operationPromiseBob = createOven(bob.pkh);
                await expect(operationPromiseBob).to.be.eventually.fulfilled;
            });
        });

        describe('parameter validation', () => {
            it('should not be possible to createOven with invalid type parameter bytes', async () => {
                const lambdaParameters = `()`; // createOven does not accept unit as a parameter
                const operationPromise = helpers.core.instance.methods.runEntrypointLambda(
                    'createOven',
                    testPackValue(lambdaParameters)
                ).send();

                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.core.lambdaParameterWrongType)
            });

            describe('ovenOwner validation', () => {
                
                const expectToBeRejectedWithInvalidOvenOwner = async (operationPromise) => {
                    await expect(operationPromise).to.be.eventually.rejected
                        .and.have.property('message', contractErrors.core.invalidOvenOwner);
                }

                it('should not be possible to createOven with wXTZ Core as the ovenOwner', async () => {
                    const operationPromise = createOven(
                        null, 
                        helpers.core.instance.address
                    );
                    await expectToBeRejectedWithInvalidOvenOwner(operationPromise);
                });

                it('should not be possible to createOven with wXTZ Token contract as the ovenOwner', async () => {
                    const operationPromise = createOven(
                        null,
                        helpers.tzip7.instance.address
                    );
                    await expectToBeRejectedWithInvalidOvenOwner(operationPromise);
                });

                it('should not be possible to createOven with an existing wXTZ Oven as the ovenOwner', async () => {
                    const { ovenAddress } = await createOven();
                    const operationPromise = createOven(
                        null,
                        ovenAddress
                    );
                    await expectToBeRejectedWithInvalidOvenOwner(operationPromise);
                });
            })
        });


        describe('emitted operations', () => {
            let internalOperationResults;
            /**
             * TODO: figure out a better test nesting to allow for `before` to be used
             * instead of `beforeEach` in order to optimize test run speed
             */
            beforeEach(async () => { 
                const { operation, ovenHelpers } = await createOven();
                helpers.oven = ovenHelpers;
                internalOperationResults = operation.results[0].metadata.internal_operation_results;
            });

            it('should emit two operations', () => {
                expect(internalOperationResults.length).to.be.equal(2);
            });

            it('should emit an origination operation', () => {
                const originationOperation = internalOperationResults[0];

                expect(originationOperation.kind).to.be.equal('origination');
                expect(originationOperation.delegate).to.be.equal(defaultDelegate);
                expect(originationOperation.balance).to.be.equal(`${defaultAmount}`);
                expect(originationOperation.source).to.be.equal(helpers.core.instance.address);
            });

            it('should emit a mint operation', async () => {
                const mintOperation = internalOperationResults[1];
                expect(mintOperation.kind).to.be.equal('transaction');
                expect(mintOperation.source).to.be.equal(helpers.core.instance.address);
                expect(mintOperation.destination).to.be.equal(helpers.tzip7.instance.address);
                
                const params = mintOperation.parameters;
                const amountToMint = params.value.args[1].int;
                expect(params.entrypoint).to.be.equal('mint');
                expect(amountToMint).to.be.equal(`${defaultAmount}`)
            });

            describe('oven origination', () => {
                it('should have been originated with the correct core address in storage', async () => {
                    const ovenCoreAddress = await helpers.oven.getCoreAddress();
                    expect(ovenCoreAddress).to.be.equal(helpers.core.instance.address);
                });

                it('should have been originated with the correct script/code', async () => {
                    const originatedMichelineCode = (await Tezos.rpc
                        .getScript(helpers.oven.instance.address))
                        .code[2].args[0]
                    /**
                     * Compare with a mock ovenWrapper, to overcome oven.tz include difficulties regarding inlining
                     */
                    // TODO: throws an unhandled promise rejection because packing fails (most likely)
                    // but the test seems to work fine
                    const ovenScriptMichelineCode = loadLambdaArtifact(
                        'contracts/partials/wxtz/core/test/oven/ovenWrapper.religo',
                        true,
                    ).micheline.code;

                    expect(originatedMichelineCode).to.be.deep.equal(ovenScriptMichelineCode);
                });
            });
        });

        describe('storage updates', () => {

            it('should add the default oven owner and originated address to the storage', async () => {
                const { ovenHelpers } = await createOven();
                const realOvenOwner = await helpers.core.getOvenOwner(ovenHelpers.instance.address);
                expect(realOvenOwner).to.be.equal(defaultOwner);
            });

            it('should add the oven owner and originated oven address to the storage', async () => {
                const ovenOwner = carol.pkh;
                const { ovenHelpers } = await createOven(bob.pkh, ovenOwner);
                const realOvenOwner = await helpers.core.getOvenOwner(ovenHelpers.instance.address);
                expect(realOvenOwner).to.be.equal(ovenOwner);
            });
        });
    }); 
});
