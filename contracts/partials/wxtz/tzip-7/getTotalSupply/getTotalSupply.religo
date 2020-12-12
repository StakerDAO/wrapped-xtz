let getTotalSupply = ((getTotalSupplyParameter, tokenStorage): (getTotalSupplyParameter, tokenStorage)): tokenEntrypointReturn => {
    let totalSupply = tokenStorage.totalSupply;
    let operation = Tezos.transaction(
        totalSupply,
        0mutez,
        getTotalSupplyParameter.callback
    );
    ([operation], tokenStorage)
};
