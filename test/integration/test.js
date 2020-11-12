const _coreHelpers = require('../helpers/core');
const coreInitialStorage = require('../../migrations/initialStorage/core');
const { alice, bob } = require('../../scripts/sandbox/accounts');
const _taquitoHelpers = require('../helpers/taquito');
const _ovenHelpers = require('../helpers/oven');
const _tzip7Helpers = require('../helpers/tzip-7');
const tzip7InitialStorage = require('../../migrations/initialStorage/tzip-7');

contract('core', () => {
    describe('createOven', () => {

        let helpers = {};

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            const { tzip7Address, tzip7Helpers } = await _tzip7Helpers.originate(tzip7InitialStorage.base);
            const { coreAddress, coreHelpers } = await _coreHelpers.originate(
                coreInitialStorage.base(tzip7Address)
            );
            helpers = { tzip7Helpers, coreHelpers };

            await helpers.tzip7Helpers.setAdministrator(coreAddress);
        });

        it('should create an oven and send a deposit to it', async () => {
            const { ovenHelpers } = await helpers.coreHelpers.createOven(
                "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // delegate
                "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", // owner
                {
                    amount: 1000 // deposit
                }
            );

            _taquitoHelpers.signAs(bob.sk, async () => {
                await ovenHelpers.default(1000)
            });
        });

    });
});