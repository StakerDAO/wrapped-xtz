let getTotalSupply = ((p,s): (getTotalSupplyParameter, storage)): (list(operation), storage) => {
  let total = s.token.totalSupply;
  let op = Tezos.transaction(
    total, 
    0mutez,
    p.callback
  );
  ([op],s)
};