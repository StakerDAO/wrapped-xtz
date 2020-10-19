let revealSecretHash = ((revealSecretHashParameter, bridgeStorage) : (revealSecretHashParameter, bridgeStorage)) : (list (operation), bridgeStorage) => {
	let swap = switch (Big_map.find_opt(revealSecretHashParameter.lockId, bridgeStorage.swaps)) {
		| Some(swap) => swap
		| None => (failwith("SwapLockDoesNotExist"): swap)
    };
	switch (Tezos.sender == swap.from_) {
		| true => unit
		| false => (failwith("SenderIsNotTheInitiator"): unit)
	};
	let newOutcomes = switch (Big_map.find_opt(revealSecretHashParameter.lockId, bridgeStorage.outcomes)) {
		| Some(outcome) => {
			switch (outcome) {
			| HashRevealed(secretHash) => (failwith("SecretHashIsAlreadySet"): outcomes)
			| SecretRevealed(secret) => (failwith("SwapAlreadyPerformed"): outcomes)
			| Refunded(value) => (failwith("SwapAlreadyRefunded"): outcomes)
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
	(([]: list(operation)), newBridgeStorage);
};