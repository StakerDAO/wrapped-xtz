const { expect } = require('chai').use(require('chai-as-promised'));
const before = require("../before");
const _coreInitialStorage = require('../../../../migrations/initialStorage/core');
const _tzip7InitialStorage = require('../../../../migrations/initialStorage/tzip-7');
const _taquitoHelpers = require('./../../../helpers/taquito');
const { alice, bob } = require('../../../../scripts/sandbox/accounts');
const { contractErrors, rpcErrors } = require('../../../../helpers/constants');
const testPackValue = require('../../../../scripts/lambdaCompiler/testPackValue');

contract('core', () => {

    let helpers = {};

    beforeEach(async () => {
        helpers = {};
        await before({
            tzip7: _tzip7InitialStorage.withBalances,
            core: _coreInitialStorage.test.base
        }, helpers)
    });

    describe('setArbitraryValue', () => {
        // by default alice is the signer, and she is also the default admin
        it('should not be callable by a non-admin address', async () => {
            const arbitraryValue = `("${bob.pkh}": address)`
            const operationPromise = _taquitoHelpers.signAs(bob.sk, async () => {
                return helpers.core.setArbitraryValue(
                    "admin",
                    arbitraryValue
                )
            });
            await expect(operationPromise).to.be.eventually.rejected
                .and.have.property('message', contractErrors.core.senderIsNotAdmin)
        });

        // explicitly test the entrypoint call as the defined admin
        it('should be callable by the admin', async () => {
            const arbitraryValueKey = "admin";
            const arbitraryValue = `("${bob.pkh}": address)`
            const operationPromise = _taquitoHelpers.signAs(alice.sk, async () => {
                return helpers.core.setArbitraryValue(
                    arbitraryValueKey,
                    arbitraryValue
                );
            })
            await expect(operationPromise).to.be.eventually.fulfilled
            const newArbitraryValue = await helpers.core.getArbitraryValue(arbitraryValueKey);
            expect(newArbitraryValue).to.be.equal(testPackValue(arbitraryValue));
        });

        it('should allow creating a new arbitrary value', async () => {
            const arbitraryValueKey = "i-dont-exist";
            const arbitraryValue = `("some-value")`;
            const nonExistingArbitraryValue = await helpers.core.getArbitraryValue(arbitraryValueKey)
            
            expect(nonExistingArbitraryValue).to.be.undefined;

            const operationPromise = helpers.core.setArbitraryValue(
                arbitraryValueKey,
                arbitraryValue
            );

            await expect(operationPromise).to.be.eventually.fulfilled;
            const newArbitraryValue = await helpers.core.getArbitraryValue(arbitraryValueKey);
            
            expect(newArbitraryValue).to.be.equal(testPackValue(arbitraryValue))
        })

        /**
         * Calling `setArbitraryValue` as demonstrated here
         * virtually acts as `setAdministrator` for the wXTZ Core
         */
        it('should allow updating of an existing arbitrary value', async () => {
            const arbitraryValueKey = "admin";
            const expectedArbitraryValue = `("${alice.pkh}": address)`;
            const newArbitraryValue = `("${bob.pkh}": address)`;

            const currentArbitraryValue = await helpers.core.getArbitraryValue(arbitraryValueKey)
            
            expect(currentArbitraryValue).to.be.equal(testPackValue(expectedArbitraryValue));

            const operationPromise = helpers.core.setArbitraryValue(
                arbitraryValueKey,
                newArbitraryValue
            );

            await expect(operationPromise).to.be.eventually.fulfilled;
            const updatedArbitraryValue = await helpers.core.getArbitraryValue(arbitraryValueKey);
            
            expect(updatedArbitraryValue).to.be.equal(testPackValue(newArbitraryValue))
        })

        it('should not be callable with malformed parameters', async () => {
            let operationPromise = helpers.core.runEntrypointLambda(
                'setArbitraryValue',
                '()'
            )

            await expect(operationPromise).to.be.eventually.rejected
                .and.have.property('message', contractErrors.core.lambdaParameterWrongType)
        });
    })
});