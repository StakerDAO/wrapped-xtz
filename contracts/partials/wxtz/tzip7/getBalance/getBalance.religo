let getBalance = ((getBalanceParameter, tokenStorage): (getBalanceParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	let optionalBalanceValue = Big_map.find_opt(getBalanceParameter.owner, tokenStorage.ledger);
	let balanceValue = switch (optionalBalanceValue) {
		| Some value => value
		| None => defaultBalance
	};
	let op = Tezos.transaction(
		balanceValue,
		0mutez,
		getBalanceParameter.callback
	);
	([op], tokenStorage)
};