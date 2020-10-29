let getOutcome = ((getOutcomeParameter, bridgeStorage): (getOutcomeParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
	let secret = Big_map.find_opt(
		getOutcomeParameter.secretHash,
		bridgeStorage.outcomes
	);
	let secret = switch (secret) {
		| Some(value) => value
		| None => (failwith("errorSwapLockDoesNotExist"): secret)
	};
	let op = Tezos.transaction(
		secret,
		0mutez,
		getOutcomeParameter.callback
	);
	([op], bridgeStorage)
};