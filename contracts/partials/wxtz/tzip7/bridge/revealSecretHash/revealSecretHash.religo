let revealSecretHash = ((revealSecretHashParameter, bridgeStorage): (revealSecretHashParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
	let swap = switch (Big_map.find_opt(revealSecretHashParameter.lockId, bridgeStorage.swaps)) {
		| Some(swap) => swap
		| None => (failwith(errorSwapLockDoesNotExist): swap)
    };
	switch (Tezos.sender == swap.from_) {
		| true => unit
		| false => (failwith(errorSenderIsNotInitiator): unit)
	};
	let newOutcomes = switch (Big_map.find_opt(revealSecretHashParameter.lockId, bridgeStorage.outcomes)) {
		| Some(outcome) => {
			switch (outcome) {
			| HashRevealed(secretHash) => (failwith(errorSecretHashIsAlreadySet): outcomes)
			| SecretRevealed(secret) => (failwith(errorSwapAlreadyPerformed): outcomes)
			| Refunded(value) => (failwith(errorSwapAlreadyRefunded): outcomes)
			};
		}
		| None => {
			Big_map.add(
				revealSecretHashParameter.lockId,
				HashRevealed(revealSecretHashParameter.secretHash),
				bridgeStorage.outcomes
			);
		}
	};
	let newBridgeStorage = {
		...bridgeStorage,
		outcomes: newOutcomes,
	};
	(emptyListOfOperations, newBridgeStorage)
};