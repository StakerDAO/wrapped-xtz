let getAllowance = ((getAllowanceParameter, tokenStorage): (getAllowanceParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	let optionalAllowanceValue = Big_map.find_opt(
		(getAllowanceParameter.owner, getAllowanceParameter.spender),
		tokenStorage.approvals
	);
	let allowanceValue = switch (optionalAllowanceValue) {
		| Some(value) => value
		| None => defaultBalance
	};
	let operation = Tezos.transaction(
		allowanceValue,
		0mutez,
		getAllowanceParameter.callback
	);
	([operation], tokenStorage)
};