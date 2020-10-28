let burn = ((burnParameter, tokenStorage): (burnParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
    // check for paused state
    switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): unit)
		| false => unit	
	};
    // check for permission
    switch(Tezos.sender == tokenStorage.admin) {
        | true => unit
        | false => (failwith(errorNoPermission): unit)
    };

    let tokenBalance = Big_map.find_opt(burnParameter.from_, tokenStorage.ledger);
    let tokenBalance = switch (tokenBalance) {
        | Some(tokenBalance) => tokenBalance
        | None => defaultBalance
    };

    if (tokenBalance < burnParameter.value) { 
        (failwith(errorNotEnoughBalance): (entrypointReturn, tokenStorage))
    }
    else {
        let newTokenBalance = abs(tokenBalance - burnParameter.value);
        let newTokens = Big_map.update(
            burnParameter.from_,
            Some(newTokenBalance),
            tokenStorage.ledger
        );
        let newTotalSupply = abs(tokenStorage.totalSupply - burnParameter.value);
        let newStorage = {
            ...tokenStorage,
            ledger: newTokens,
            totalSupply: newTotalSupply,
        };
        (emptyListOfOperations, newStorage)
    };
};