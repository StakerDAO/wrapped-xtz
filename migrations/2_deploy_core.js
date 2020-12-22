const core = artifacts.require('core');
const saveContractAddress = require('../helpers/saveContractAddress');
const coreInitialStorage = require('./initialStorage/core');
const config = require('../truffle-config');
const finishSetup = require('./finishSetup/finishSetup');

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(core, coreInitialStorage.base(
        require('./../deployments/tzip-7')
    ))
    .then(contract => {
        saveContractAddress('core', contract.address)

        if (config.networks[network].finishSetup) {
            return finishSetup(network, contract.address)
        };
    })
    .then(operation => { 
        if (operation && operation.hash) {
            console.log("Finished setup with new Administrator")
            console.log("Operation Hash", operation.hash)
        };
    });
};
