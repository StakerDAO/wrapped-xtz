const _taquitoHelpers = require('../../test/helpers/taquito');
const config = require('../../truffle-config');
const tzip7Address = require('./../../deployments/tzip-7')
const { Tezos } = require('@taquito/taquito');

module.exports = async (network, coreAddress) => {
    await _taquitoHelpers.initializeWithRpc(config.networks[network].host, config.networks[network].port);
    await _taquitoHelpers.setSigner(config.networks[network].secretKey);
    
    const tzip7Contract = await Tezos.contract.at(tzip7Address);
    const operation = await tzip7Contract.methods.setAdministrator(coreAddress).send();
    await operation.confirmation(1);
    return operation
};
