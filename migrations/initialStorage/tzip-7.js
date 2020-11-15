const { MichelsonMap, UnitValue } = require('@taquito/taquito');
const { alice, bob, walter } = require('../../scripts/sandbox/accounts');
const initialStorage = {};

initialStorage.base = {
    token: {
        ledger: new MichelsonMap,
        approvals: new MichelsonMap,
        admin: alice.pkh,
        pauseGuardian: walter.pkh,
        paused: false,
        totalSupply: 0,
    },
    bridge: {
        swaps: new MichelsonMap,
        outcomes: new MichelsonMap
    },
};

initialStorage.withBalances = {
    ...initialStorage.base,
    token: {
        ...initialStorage.base.token,
        ledger: MichelsonMap.fromLiteral({
            [alice.pkh]: 30, 
        }),
        totalSupply: 30,
    },
};

module.exports = initialStorage;