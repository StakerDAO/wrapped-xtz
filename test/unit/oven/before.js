const _coreHelpers = require('../../helpers/core');
const _coreInitialStorage = require('../../../migrations/initialStorage/core');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');

module.exports = async (ownerAddress, initialAmount, helpers) => {

    let { tzip7Helpers, tzip7Address } = await _tzip7Helpers.originate(_tzip7InitialStorage.base);
    helpers.tzip7 = tzip7Helpers;

    let { coreHelpers, coreAddress } = await _coreHelpers.originate(
        _coreInitialStorage.base(tzip7Address)
    );
    helpers.core = coreHelpers;

    await tzip7Helpers.setAdministrator(coreAddress);

    let { ovenHelpers } = await coreHelpers.createOven(
        null, // delegate
        ownerAddress, // owner
        {
            amount: initialAmount
        }
    );
    helpers.oven = ovenHelpers;

    return helpers;
};
