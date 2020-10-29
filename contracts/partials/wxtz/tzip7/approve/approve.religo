let approve = ((approveParameter, tokenStorage): (approveParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	let isPaused = switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};

	let previousState = Big_map.find_opt(
		(approveParameter.spender, Tezos.sender),
		tokenStorage.approvals
	);
	let previousState = switch (previousState) {
		| Some(value) => value
		| None => defaultBalance
	};
	/**
	 * Changing allowance value from a non-zero value to a non-zero value is forbidden
	 * to prevent this attack vector https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/
	 */
	if (previousState > 0n && approveParameter.value > 0n)
		{ 
			(failwith(errorUnsafeAllowanceChange): (entrypointReturn, tokenStorage))
		}
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