const { MichelsonMap, UnitValue } = require('@taquito/taquito');
const { alice, bob, carol, walter } = require('../../scripts/sandbox/accounts');
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

initialStorage.setPause = {
    ...initialStorage.base,
    token: {
        ...initialStorage.base.token,
        ledger: MichelsonMap.fromLiteral({
            [alice.pkh]: 100000000, 
            [bob.pkh]: 100000000,
            [carol.pkh]: 100000000
        }),
        approvals:  (()=> {
            const map = new MichelsonMap;
            map.set({ // Pair as Key
                0 : bob.pkh, //nat
                1 : carol.pkh //address
              }, 100000);
            return map;
        })(),
        totalSupply: 300000000,
    },
};

module.exports = initialStorage;