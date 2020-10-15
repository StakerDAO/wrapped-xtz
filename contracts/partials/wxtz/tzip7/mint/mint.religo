let mint = ((mintParameter, storage): (mintParameter, tokenStorage)): (list(operation), tokenStorage) => {
	if (Tezos.sender == storage.admin) {
		let value = switch (Big_map.find_opt(mintParameter.to_, storage.ledger)) {
			| Some(value) => value
			| None => 0n
		};
		let newBalance = value + mintParameter.value;
		let newTokens = Big_map.update(
			mintParameter.to_,
			Some(newBalance),
			storage.ledger
		);
		let newStorage = {
			...storage,
			ledger: newTokens
		};
		([]: list(operation), newStorage)
	} else {
		(failwith ("NoPermission"): (list(operation), tokenStorage));
	};
};