let burn = ((burnParameter, tokenStorage): (burnParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);
    // only the admin is allowed to burn tokens
    failIfNotAdmin(tokenStorage);

    let tokenBalance = getTokenBalance(burnParameter.from_, tokenStorage.ledger);

    // calculate new balance and update token ledger storage accordingly
    let reducedTokenBalance = safeBalanceSubtraction(tokenBalance, burnParameter.value);
    let ledger = setTokenBalance(
        burnParameter.from_,
        reducedTokenBalance,
        tokenStorage.ledger
    );
    // update total token supply accordingly
    let totalSupply = abs(tokenStorage.totalSupply - burnParameter.value);
    let tokenStorage = {
        ...tokenStorage,
        ledger: ledger,
        totalSupply: totalSupply,
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, tokenStorage);
};