let burn = ((burnParameter, tokenStorage): (burnParameter, tokenStorage)): tokenEntrypointReturn => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);
    
    // only the admin is allowed to burn tokens
    switch(Tezos.sender == tokenStorage.admin) {
        | true => unit
        | false => (failwith(errorSenderIsNotAdmin): unit)
    };
    let tokenBalance = getTokenBalance(burnParameter.from_, tokenStorage.ledger);

    // calculate new balance and update token ledger storage accordingly
    let reducedTokenBalance = safeBalanceSubtraction(tokenBalance, burnParameter.value);
    let ledger = Big_map.update(
        burnParameter.from_,
        Some(reducedTokenBalance),
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