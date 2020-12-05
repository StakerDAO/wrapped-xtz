let approveCAS = ((approveCASParameter, tokenStorage): (approveCASParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);
	// retrieve existing allowance and set default value if none was found
    let previousState = Big_map.find_opt(
        (Tezos.sender, approveCASParameter.spender),
        tokenStorage.approvals
    );
	let previousState = switch (previousState) {
        | Some(value) => value
        | None => defaultBalance
	};

    /**
     * If the expected allowance matches the current amount this function behaves as approve,
     * but it does not prohibit changing allowance from non-zero to non-zero
     */
	if (previousState != approveCASParameter.expected) { 
        (failwith(errorAllowanceMismatch): (entrypointReturn, tokenStorage)) 
    }
	else {
		let newAllowances = Big_map.update(
			(Tezos.sender, approveCASParameter.spender),
			Some(approveCASParameter.value),
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