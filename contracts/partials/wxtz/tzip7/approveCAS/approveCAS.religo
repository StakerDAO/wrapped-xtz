let approveCAS = ((approveCASParameter, tokenStorage): (approveCASParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
    let isPaused = switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};

	let previousState = switch (Big_map.find_opt((approveCASParameter.spender, Tezos.sender), tokenStorage.approvals)){
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
			(approveCASParameter.spender, Tezos.sender),
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