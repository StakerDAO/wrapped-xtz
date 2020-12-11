const { expect } = require('chai').use(require('chai-as-promised'));
const _coreInitialStorage = require('../../../../migrations/initialStorage/core');
const _taquitoHelpers = require('./../../../helpers/taquito');
const { TezosOperationError } = require('@taquito/taquito');
const { contractErrors } = require('../../../../helpers/constants');
const loadLambdaArtifact = require('../../../../scripts/lambdaCompiler/loadLambdaArtifact');
const { chuck } = require('../../../../scripts/sandbox/accounts');
const before = require("../before");

// using for testing purposes bytes of a dummy lambda
const bytes = loadLambdaArtifact(
    'contracts/partials/wxtz/core/test/runEntrypointLambda/simpleEntrypointLambda.religo',
    false
).bytes

contract('core', () => {
    let helpers = {};
    const lambdasList = [
        {
            lambdaName: 'entrypoint/createOven',
            bytes: bytes
        },
        {
            lambdaName: 'entrypoint/updateLambdas',
            bytes: bytes
        }
    ];
    
    describe('core contract testing %updateLambdas entrypoint', () => {

        beforeEach(async () => await before({
            core: _coreInitialStorage.test.base()
        }, helpers));

        it('should be callable by admin', async () => {
            const operationPromise =  helpers.core.updateLambdas(lambdasList);
            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        it('should fail for non-admins', async () => {
            // sign as non-admin
            const operationPromise = _taquitoHelpers.signAs(chuck.sk, async () => {
                await helpers.core.updateLambdas(lambdasList);
            });

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.senderIsNotAdmin)
        });
    
        describe('effects of updating one lambda at once', () => {
            
            beforeEach(async () => {
                await helpers.core.updateLambdas([lambdasList[0]]);
            });
    
            it('should update lambda', async () => {
                const lambdaBytesFromInititalStorage = _coreInitialStorage.test.base().lambdas.get(lambdasList[0].lambdaName);
                const lambdaBytesFromContractStorage = await helpers.core.getLambda(lambdasList[0].lambdaName);
                expect(lambdaBytesFromContractStorage).to.not.equal(lambdaBytesFromInititalStorage);
                expect(lambdaBytesFromContractStorage).to.equal(lambdasList[0].bytes);
            });
        });
    
        describe('effects of updating multiple lambdas at once', () => {
            
            beforeEach(async () => {
                await helpers.core.updateLambdas(lambdasList);
            });
    
            it('should update lambda for the first item in the list', async () => {
                const lambdaBytesFromInititalStorage = _coreInitialStorage.test.base().lambdas.get(lambdasList[0].lambdaName);
                const lambdaBytesFromContractStorage = await helpers.core.getLambda(lambdasList[0].lambdaName);
                expect(lambdaBytesFromContractStorage).to.not.equal(lambdaBytesFromInititalStorage);
                expect(lambdaBytesFromContractStorage).to.equal(lambdasList[0].bytes);
            });
    
            it('should update lambda for the second item in the list', async () => {
                const lambdaBytesFromInititalStorage = _coreInitialStorage.test.base().lambdas.get(lambdasList[1].lambdaName);
                const lambdaBytesFromContractStorage = await helpers.core.getLambda(lambdasList[1].lambdaName);
                expect(lambdaBytesFromContractStorage).to.not.equal(lambdaBytesFromInititalStorage);
                expect(lambdaBytesFromContractStorage).to.equal(lambdasList[1].bytes);
            });
    
            it('should update lambda for updateLambdas itself and change its behaviour', async () => {
                // breaks %updateLambda entrypoint for updates
                const operationPromise = helpers.core.updateLambdas(lambdasList);
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.core.lambdaParameterWrongType)
            })
        });
    });
    
    describe('scenario with an invalid admin address in storage', () => {

        beforeEach(async () => await before({
            core: _coreInitialStorage.test.updateLambdasBrokenAdminAddress()
        }, helpers));

        it('should fail for a wrong address type as admin', async () => {
            const operationPromise =  helpers.core.updateLambdas(lambdasList);

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.adminAddressWrongType)
        });
    });

    describe("scenario with a missing arbitrary key (admin's address)", () => {

        beforeEach(async () => await before({
            core: _coreInitialStorage.test.updateLambdasMissingAdminAddress()
        }, helpers));

        it('should fail for missing arbitrary key', async () => {
            const operationPromise =  helpers.core.updateLambdas(lambdasList);
           
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.arbitraryValueKeyNotFound)
        });
    });

    describe('scenario with a broken arbitrary lambda (checking admin permission)', () => {
        
        beforeEach(async () => await before({
            core: _coreInitialStorage.test.updateLambdasBrokenArbitraryLambda()
        }, helpers));

        it('should fail for non-arbitrary lambda', async () => {
            const operationPromise =  helpers.core.updateLambdas(lambdasList);
            
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.lambdaNotArbitrary)
        });
    });    
});