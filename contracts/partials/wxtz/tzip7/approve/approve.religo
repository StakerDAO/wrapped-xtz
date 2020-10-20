let approve = ((approveParameter, tokenStorage): (approveParameter, tokenStorage)): (list(operation), tokenStorage) => {
	let isPaused = switch (tokenStorage.paused) {
		| true => (failwith("TokenOperationsArePaused"): bool)
		| false => false	
	};

	let previousState = switch (Big_map.find_opt((approveParameter.spender, Tezos.sender), tokenStorage.approvals)){
	| Some(value) => value
	| None => 0n
	};
	if (previousState > 0n && approveParameter.value > 0n)
	{ (failwith("Unsafe Allowance Change"): (list(operation), tokenStorage)); }
	else {
		let newAllowances = Big_map.update(
			(approveParameter.spender, Tezos.sender),
			Some(approveParameter.value),
			tokenStorage.approvals
		);
		let newStorage = {
				...tokenStorage,
				approvals: newAllowances
		};
		(([]: list(operation)), newStorage)
	};
};