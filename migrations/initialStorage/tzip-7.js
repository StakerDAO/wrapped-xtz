const { MichelsonMap } = require('@taquito/taquito');
const { alice, bob, carol, trent, walter } = require('../../scripts/sandbox/accounts');
const initialStorage = {};
const getDelayedISOTime = require('../../helpers/getDelayedISOTime');

initialStorage.base = {
    token: {
        ledger: new MichelsonMap,
        approvals: new MichelsonMap,
        admin: alice.pkh,
        pauseGuardian: walter.pkh, // warden
        paused: false,
        totalSupply: 0,
    },
    bridge: {
        swaps: new MichelsonMap,
        outcomes: new MichelsonMap,
        lockSaver: trent.pkh, // trusted arbitrator
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
                0: bob.pkh, //nat
                1: carol.pkh //address
              }, 100000);
            return map;
        })(),
        totalSupply: 200000000,
    },
};

initialStorage.test = {};

initialStorage.test.lock = () => {
    let storage = initialStorage.withApprovals;
    const swapId = {
        0: 'b7c1fcab1eac98de7a021c73906e2c930cb46d9cf1c90aef6bd549f0ba00f25a', 
        1: bob.pkh
    };
    storage.bridge.swaps.set(swapId, {
        confirmed: false,
        fee: 100,
        from: bob.pkh,
        releaseTime: getDelayedISOTime(60),
        to: carol.pkh,
        value: 5000
    })
    return storage;
};

initialStorage.test.confirmSwap = (swapId, confirmed, releaseTime) => {
    let storage = initialStorage.withApprovals;

    storage.bridge.swaps.set(swapId, {
        confirmed: confirmed,
        fee: 100,
        from: bob.pkh,
        releaseTime: releaseTime,
        to: carol.pkh,
        value: 5000
    });
    return storage;
};

initialStorage.test.redeem = (swapLockParameters, swapInitiator) => {
    let storage = initialStorage.withApprovals;
    // michelson pair
    const swapId = {
        0: swapLockParameters.secretHash,
        1: swapInitiator
    };
    storage.bridge.swaps.set(swapId, {
        confirmed: swapLockParameters.confirmed,
        fee: swapLockParameters.fee,
        from: swapInitiator,
        releaseTime: swapLockParameters.releaseTime,
        to: swapLockParameters.to,
        value: swapLockParameters.value
    });
    // set enough balance for lockSaver account
    const totalValue = swapLockParameters.fee + swapLockParameters.value;
    storage.token.ledger.set(trent.pkh, totalValue);
    return storage;
};

initialStorage.test.claimRefund = (swapLockParameters, swapInitiator) => {
    return initialStorage.test.redeem(swapLockParameters, swapInitiator);
};

initialStorage.test.paused = {
    ...initialStorage.base,
    paused: true
};

module.exports = initialStorage;
