let getBalance = ((getBalanceParameter, tokenStorage): (getBalanceParameter, tokenStorage)): (list(operation), tokenStorage) => {
	let value = switch (Big_map.find_opt(getBalanceParameter.owner, tokenStorage.ledger)) {
		| Some value => value
		| None => 0n
	};
	let op = Tezos.transaction(
		value,
		0mutez,
		getBalanceParameter.callback
	);
	([op], tokenStorage)
};