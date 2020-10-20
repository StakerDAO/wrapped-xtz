let mint = ((mintParameter, tokenStorage): (mintParameter, tokenStorage)): (list(operation), tokenStorage) => {
	if (Tezos.sender == tokenStorage.admin) {
		let value = switch (Big_map.find_opt(mintParameter.to_, tokenStorage.ledger)) {
			| Some(value) => value
			| None => 0n
		};
		let newBalance = value + mintParameter.value;
		let newTokens = Big_map.update(
			mintParameter.to_,
			Some(newBalance),
			tokenStorage.ledger
		);
		let newTotalSupply = tokenStorage.totalSupply + mintParameter.value;
		let newStorage = {
			...tokenStorage,
			ledger: newTokens,
			totalSupply: newTotalSupply
		};
		([]: list(operation), newStorage)
	} else {
		(failwith ("NoPermission"): (list(operation), tokenStorage));
	};
};