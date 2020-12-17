let setOutcome = ((secretHash, secret, bridgeStorage): (secretHash, secret, bridgeStorage)): bridgeStorage => {
    let outcomes = Big_map.add(
        secretHash,
        secret,
        bridgeStorage.outcomes
    );
    let bridgeStorage = {
        ...bridgeStorage,
        outcomes: outcomes,
    };
    bridgeStorage;
};
