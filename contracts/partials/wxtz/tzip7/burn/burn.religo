let burn = ((burnParameter, tokenStorage): (burnParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);
    
    // only the admin is allowed to burn tokens
    switch(Tezos.sender == tokenStorage.admin) {
        | true => unit
        | false => (failwith(errorNoPermission): unit)
    };
    let tokenBalance = getTokenBalance(burnParameter.from_, tokenStorage.ledger);

    // continue only if amount to burn does not exceed available balance
    if (tokenBalance < burnParameter.value) { 
        (failwith(errorNotEnoughBalance): (entrypointReturn, tokenStorage))
    }
    else {
        // calculate new balance and update token ledger storage accordingly
        let newTokenBalance = abs(tokenBalance - burnParameter.value);
        let newTokens = Big_map.update(
            burnParameter.from_,
            Some(newTokenBalance),
            tokenStorage.ledger
        );
        // update total token supply accordingly
        let newTotalSupply = abs(tokenStorage.totalSupply - burnParameter.value);
        let newStorage = {
            ...tokenStorage,
            ledger: newTokens,
            totalSupply: newTotalSupply,
        };
        // no operations are returned, only the updated storage
        (emptyListOfOperations, newStorage);
    };
};