let mint = ((mintParameter, tokenStorage): (mintParameter, tokenStorage)): tokenEntrypointReturn => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);

	// only the admin is allowed to mint tokens
    switch(Tezos.sender == tokenStorage.admin) {
        | true => unit
        | false => (failwith(errorSenderIsNotAdmin): unit)
    };

	// retrieve token balance before minting operation and calculate new token balance
	let tokenBalance = getTokenBalance(mintParameter.to_, tokenStorage.ledger);

	let increasedTokenBalance = tokenBalance + mintParameter.value;
	let ledger = Big_map.update(
		mintParameter.to_,
		Some(increasedTokenBalance),
		tokenStorage.ledger
	);
	// update total supply accordingly
	let totalSupply = tokenStorage.totalSupply + mintParameter.value;
	let tokenStorage = {
		...tokenStorage,
		ledger: ledger,
		totalSupply: totalSupply
	};
	// no operations are returned, only the updated token storage
	(emptyListOfOperations, tokenStorage);
};