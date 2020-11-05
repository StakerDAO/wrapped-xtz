let approve = ((approveParameter, tokenStorage): (approveParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	let isPaused = switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};
	// retrieve existing allowance and set default value if none was found
	let previousState = Big_map.find_opt(
		(Tezos.sender, approveParameter.spender),
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
	if (previousState > 0n && approveParameter.value > 0n) { 
		(failwith(errorUnsafeAllowanceChange): (entrypointReturn, tokenStorage));
	}
	else {
		// update new allowance from 0 to parameter.value or from previous state value to 0
		let newAllowances = Big_map.update(
			(Tezos.sender, approveParameter.spender),
			Some(approveParameter.value),
			tokenStorage.approvals
		);
		let newStorage = {
				...tokenStorage,
				approvals: newAllowances
		};
		// no operations are returned, only the updated storage
		(emptyListOfOperations, newStorage);
	};
};