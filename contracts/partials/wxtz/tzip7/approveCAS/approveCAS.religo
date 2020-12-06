let approveCAS = ((approveCASParameter, tokenStorage): (approveCASParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);
	// retrieve existing allowance
	let allowance = getTokenAllowance(
		Tezos.sender, 
		approveCASParameter.spender, 
		tokenStorage.approvals
	);

    /**
     * If the expected allowance matches the current amount this function behaves as approve,
     * but it does not prohibit changing allowance from non-zero to non-zero
     */
	if (allowance != approveCASParameter.expected) { 
        (failwith(errorAllowanceMismatch): (entrypointReturn, tokenStorage)) 
    }
	else {
		let approvals = Big_map.update(
			(Tezos.sender, approveCASParameter.spender),
			Some(approveCASParameter.value),
			tokenStorage.approvals
		);
		let tokenStorage = {
				...tokenStorage,
				approvals: approvals
		};
		// no operations are returned, only the updated storage
		(emptyListOfOperations, tokenStorage);
	};
 
};