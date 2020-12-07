let getOutcome = ((getOutcomeParameter, bridgeStorage): (getOutcomeParameter, bridgeStorage)): bridgeEntrypointReturn => {
	// retrieve secret from outcomes in bridge storage
	let secret = Big_map.find_opt(
		getOutcomeParameter.secretHash,
		bridgeStorage.outcomes
	);
	let secret = switch (secret) {
		| Some(value) => value
		| None => (failwith(errorSwapLockDoesNotExist): secret)
	};
	// create callback transaction to requesting contract
	let operation = Tezos.transaction(
		secret,
		0mutez,
		getOutcomeParameter.callback
	);
	// one operation is returned and storage is not manipulated
	([operation], bridgeStorage);
};