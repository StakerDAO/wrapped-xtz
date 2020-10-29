let approveCAS = ((approveCASParameter, tokenStorage): (approveCASParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
    let isPaused = switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};

    let previousState = Big_map.find_opt(
        (Tezos.sender, approveCASParameter.spender),
        tokenStorage.approvals
    );
	let previousState = switch (previousState) {
        | Some(value) => value
        | None => defaultBalance
	};

    /**
     * if the current amount of sender's tokens spender is allowed to spend is equal to the expected value
     * this function behaves as approve, but it does not prohibit changing allowance from non-zero to non-zero
     */
	if (previousState != approveCASParameter.expected)
	{ 
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
		(emptyListOfOperations, newStorage)
	};
 
};