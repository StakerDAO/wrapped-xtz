const tzip7 = artifacts.require('tzip-7');
const { alice } = require('./../scripts/sandbox/accounts');
const { MichelsonMap } = require('@taquito/taquito');
const saveContractAddress = require('./../helpers/saveContractAddress');
const tzip7InitialStorage = require('./initialStorage/tzip-7')

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(tzip7, tzip7InitialStorage.withBalances)
        .then(contract => saveContractAddress('tzip-7', contract.address));
};
