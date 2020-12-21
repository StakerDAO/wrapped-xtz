const tzip7 = artifacts.require('tzip-7');
const saveContractAddress = require('./../helpers/saveContractAddress');
const tzip7InitialStorage = require('./initialStorage/tzip-7')

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(tzip7, tzip7InitialStorage.base)
        .then(contract => saveContractAddress('tzip-7', contract.address));
};
