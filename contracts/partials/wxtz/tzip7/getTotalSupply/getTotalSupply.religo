let getTotalSupply = ((getTotalSupplyParameter, tokenStorage): (getTotalSupplyParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
  let total = tokenStorage.totalSupply;
  let operation = Tezos.transaction(
    total, 
    0mutez,
    getTotalSupplyParameter.callback
  );
  ([operation], tokenStorage)
};