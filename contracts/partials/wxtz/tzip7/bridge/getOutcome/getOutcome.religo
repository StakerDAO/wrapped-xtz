let getOutcome = ((getOutcomeParameter, bridgeStorage): (getOutcomeParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
	let outcome = Big_map.find_opt(
		getOutcomeParameter.secretHash,
		bridgeStorage.outcomes
	);
	let outcome = switch (outcome) {
		| Some(value) => value
		| None => (failwith("errorSwapLockDoesNotExist"): secret)
	};
	let op = Tezos.transaction(
		outcome,
		0mutez,
		getOutcomeParameter.callback
	);
	([op], bridgeStorage)
};