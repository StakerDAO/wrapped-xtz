let getTotalSupply = ((getTotalSupplyParameter, tokenStorage): (getTotalSupplyParameter, tokenStorage)): (list(operation), tokenStorage) => {
  let total = tokenStorage.totalSupply;
  let op = Tezos.transaction(
    total, 
    0mutez,
    getTotalSupplyParameter.callback
  );
  ([op], tokenStorage)
};