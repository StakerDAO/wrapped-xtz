const tzip7 = artifacts.require('tzip7');
const { alice } = require('../scripts/sandbox/accounts');
const { MichelsonMap } = require('@taquito/taquito');
const saveContractAddress = require('../helpers/saveContractAddress');

const initialStorage = {
    token: {
        ledger: MichelsonMap.fromLiteral({
            [alice.pkh]: 10, 
        }),
        approvals: new MichelsonMap,
        admin: alice.pkh,
        paused: false,
        totalSupply: 10,
    },
    bridge: {
        swaps: new MichelsonMap,
        outcomes: new MichelsonMap
    },
};

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(tzip7, initialStorage)
        .then(contract => saveContractAddress('tzip7', contract.address));
};
module.exports.initialStorage = initialStorage;
