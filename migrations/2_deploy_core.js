const core = artifacts.require('core');
const saveContractAddress = require('../helpers/saveContractAddress');
const coreInitialStorage = require('./initialStorage/core');

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(core, coreInitialStorage.base(
        require('./../deployments/tzip-7')
    ))
        .then(contract => saveContractAddress('core', contract.address));
}
