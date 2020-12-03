const { MichelsonMap, UnitValue } = require('@taquito/taquito');
const { alice, bob, carol, walter } = require('../../scripts/sandbox/accounts');
const initialStorage = {};
const getDelayedISOTime = require('../../helpers/getDelayedISOTime');
const { map } = require('lodash');

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
            [alice.pkh]: 100000000, 
            [bob.pkh]: 80000000,
            [carol.pkh]: 60000000
        }),
        totalSupply: 240000000,
    },
};

initialStorage.withApprovals = {
    ...initialStorage.withBalances,
    token: {
        ...initialStorage.withBalances.token,
        approvals:  (()=> {
            const map = new MichelsonMap;
            map.set({ // Pair as Key
                0 : bob.pkh, //nat
                1 : carol.pkh //address
              }, 100000);
            return map;
        })()
    },
};

initialStorage.burn = {
    ...initialStorage.base,
    token: {
        ...initialStorage.base.token,
        ledger: MichelsonMap.fromLiteral({
            [alice.pkh]: 100000000, 
            [bob.pkh]: 100000000
        }),
        totalSupply: 200000000,
    },
};

initialStorage.getAllowance = {
    ...initialStorage.base,
    token: {
        ...initialStorage.base.token,
        ledger: MichelsonMap.fromLiteral({
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
        totalSupply: 200000000,
    },
};

initialStorage.lock = {
    ...initialStorage.withApprovals,
    bridge: {
        swaps: MichelsonMap.fromLiteral({
            'b7c1fcab1eac98de7a021c73906e2c930cb46d9cf1c90aef6bd549f0ba00f25a': {
                confirmed: false,
                fee: 100,
                from: bob.pkh,
                releaseTime: getDelayedISOTime(1),
                to: carol.pkh,
                value: 5000
            },
        }),
        outcomes: new MichelsonMap
    },
};

initialStorage.confirmSwap = {
    ...initialStorage.withApprovals,
    bridge: {
        swaps: MichelsonMap.fromLiteral({
            'b7c1fcab1eac98de7a021c73906e2c930cb46d9cf1c90aef6bd549f0ba00f25a': {
                confirmed: false,
                fee: 100,
                from: bob.pkh,
                releaseTime: getDelayedISOTime(1),
                to: carol.pkh,
                value: 5000
            },
            '4a8c7c8c3e7a1aee998eb66b1426c19999124452e04dc9009781db1acfe54c83': {
                confirmed: true,
                fee: 50,
                from: bob.pkh,
                releaseTime: getDelayedISOTime(1),
                to: carol.pkh,
                value: 1000
            },
        }),
        outcomes: new MichelsonMap
    },
};

module.exports = initialStorage;