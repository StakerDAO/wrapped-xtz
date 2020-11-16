const _taquitoHelpers = require('./../../helpers/taquito');
const _tzip7Helpers = require('./../../helpers/tzip-7');
const _coreHelpers = require('./../../helpers/core');

const { alice } = require('./../../../scripts/sandbox/accounts');

module.exports = async (initialStorage, helpers) => {
    await _taquitoHelpers.initialize();
    await _taquitoHelpers.setSigner(alice.sk);

    // optional deployment of tzip-7
    if (initialStorage.tzip7) {
        let { tzip7Helpers } = await _tzip7Helpers.originate(initialStorage.tzip7);
        helpers.tzip7 = tzip7Helpers;
    }
    
    if (typeof initialStorage.core === 'function') {
        const initialStorageCore = initialStorage.core(helpers.tzip7.instance.address);
        let { coreHelpers } = await _coreHelpers.originate(initialStorageCore);
        helpers.core = coreHelpers;
    } else {
        let { coreHelpers } = await _coreHelpers.originate(initialStorage.core);
        helpers.core = coreHelpers;
    }

    if (helpers.tzip7) {
        await helpers.tzip7.setAdministrator(helpers.core.instance.address);
    }

    return helpers;
};