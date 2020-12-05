let mint = ((mintParameter, tokenStorage): (mintParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);

	// only the admin is allowed to mint tokens
    switch(Tezos.sender == tokenStorage.admin) {
        | true => unit
        | false => (failwith(errorNoPermission): unit)
    };

	// retrieve token balance before minting operation and calculate new token balance
	let tokenBalance = Big_map.find_opt(mintParameter.to_, tokenStorage.ledger);
	let tokenBalance = switch (tokenBalance) {
		| Some(tokenBalance) => tokenBalance
		| None => defaultBalance
	};
	let newTokenBalance = tokenBalance + mintParameter.value;
	let newTokens = Big_map.update(
		mintParameter.to_,
		Some(newTokenBalance),
		tokenStorage.ledger
	);
	// update total supply accordingly
	let newTotalSupply = tokenStorage.totalSupply + mintParameter.value;
	let newStorage = {
		...tokenStorage,
		ledger: newTokens,
		totalSupply: newTotalSupply
	};
	// no operations are returned, only the updated token storage
	(emptyListOfOperations, newStorage);
};