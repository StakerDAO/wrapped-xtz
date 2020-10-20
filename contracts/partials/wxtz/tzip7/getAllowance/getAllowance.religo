let getAllowance = ((getAllowanceParameter, tokenStorage): (getAllowanceParameter, tokenStorage)): (list(operation), tokenStorage) => {
	let value = switch (Big_map.find_opt((getAllowanceParameter.owner, getAllowanceParameter.spender), tokenStorage.approvals)) {
		| Some(value) => value
		| None => 0n
	};
	let op = Tezos.transaction(
		value,
		0mutez,
		getAllowanceParameter.callback
	);
	([op], tokenStorage)
};