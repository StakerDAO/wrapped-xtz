let mint = ((mintParameter, tokenStorage): (mintParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	if (Tezos.sender == tokenStorage.admin) {
		let optionalTokenBalance = Big_map.find_opt(mintParameter.to_, tokenStorage.ledger);
		let tokenBalance = switch (optionalTokenBalance) {
			| Some(tokenBalance) => tokenBalance
			| None => defaultBalance
		};
		let newTokenBalance = tokenBalance + mintParameter.value;
		let newTokens = Big_map.update(
			mintParameter.to_,
			Some(newTokenBalance),
			tokenStorage.ledger
		);
		let newTotalSupply = tokenStorage.totalSupply + mintParameter.value;
		let newStorage = {
			...tokenStorage,
			ledger: newTokens,
			totalSupply: newTotalSupply
		};
		(emptyListOfOperations, newStorage)
	} else {
		(failwith(errorNoPermission): (entrypointReturn, tokenStorage));
	};
};