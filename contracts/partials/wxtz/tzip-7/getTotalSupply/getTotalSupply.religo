let getTotalSupply = ((getTotalSupplyParameter, tokenStorage): (getTotalSupplyParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
    let totalSupply = tokenStorage.totalSupply;
    let operation = Tezos.transaction(
        totalSupply,
        0mutez,
        getTotalSupplyParameter.callback
    );
    ([operation], tokenStorage)
};