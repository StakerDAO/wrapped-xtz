const tzip7 = artifacts.require('tzip7');
const { alice } = require('./../scripts/sandbox/accounts');
const { MichelsonMap } = require('@taquito/taquito');
const saveContractAddress = require('./../helpers/saveContractAddress');


const initial_storage = {
    token : {
        ledger:new MichelsonMap,
        approvals: new MichelsonMap,
        admin: alice.pkh,
        paused: false,
        totalSupply: 100,
    },
    swaps 	     : new MichelsonMap,
    hashlock     : new MichelsonMap,
    status	     : new MichelsonMap,
    secrets      : new MichelsonMap,
    bridge       : {
        swaps       : new MichelsonMap,
        outcomes    : new MichelsonMap
    }
}

module.exports = async (deployer, network, accounts) => {

    // TODO format to await instead of .then
    deployer.deploy(tzip7, initial_storage)
        .then(contract => saveContractAddress('tzip7', contract.address));

};
module.exports.initial_storage = initial_storage;
