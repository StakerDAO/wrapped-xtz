const fa12 = artifacts.require('fa12');
const { alice } = require('./../scripts/sandbox/accounts');
const { MichelsonMap } = require('@taquito/taquito');
const saveContractAddress = require('./../helpers/saveContractAddress');


const initial_storage = {
    tokens       : new MichelsonMap,
    allowances   : new MichelsonMap,
    total_amount : 100,
    swaps 	     : new MichelsonMap,
    hashlock     : new MichelsonMap,
    status	     : new MichelsonMap,
    secrets      : new MichelsonMap,
}

module.exports = async (deployer, network, accounts) => {

    // TODO format to await instead of .then
    deployer.deploy(fa12, initial_storage)
        .then(contract => saveContractAddress('fa12', contract.address));

};
module.exports.initial_storage = initial_storage;