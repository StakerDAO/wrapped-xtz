let approve = ((approveParameter, tokenStorage): (approveParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	let isPaused = switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};

	let previousState = switch (Big_map.find_opt((approveParameter.spender, Tezos.sender), tokenStorage.approvals)){
	| Some(value) => value
	| None => defaultBalance
	};
	if (previousState > 0n && approveParameter.value > 0n)
	{ (failwith(errorUnsafeAllowanceChange): (entrypointReturn, tokenStorage)); }
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
		(emptyListOfOperations, newStorage)
	};
};