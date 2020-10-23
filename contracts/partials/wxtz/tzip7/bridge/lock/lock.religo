let lock = ((lockParameter, storage): (lockParameter, storage)): (entrypointReturn, storage) => {
	let swapEntry: swap = {
		to_: lockParameter.to_,
		from_: Tezos.sender,
		value: lockParameter.value,
		releaseTime: lockParameter.releaseTime,
	};
	let newSwap = switch (Big_map.find_opt(lockParameter.lockId, storage.bridge.swaps)) {
		| Some(value) => (failwith(errorSwapLockAlreadyExists): swaps)
		| None => {
			Big_map.add(
				lockParameter.lockId,
				swapEntry,
				storage.bridge.swaps
			);
		}
	};

    /**
	 * Constructing the transfer parameter for lock-up of tokens
	 */
	let transferParameter: transferParameter = {
		from_: Tezos.sender,
		to_:  Tezos.self_address,
		value: lockParameter.value,
	};
	/**
	 * Calling the transfer function to lock up the token amount specified in swap
	 */
	let (_, newTokenStorage) = transfer((transferParameter, storage.token));

	/**
	 * Check whether the optional secretHash was provided as parameter
	 * If hash was revealed, saved it to outcomes
	 */
	let newBridgeStorage = switch (lockParameter.secretHash) {
		| Some(secretHash) => {
			let newOutcome = Big_map.add(
				lockParameter.lockId,
				HashRevealed(secretHash),
				storage.bridge.outcomes
			);
			{ 
				...storage.bridge,
				swaps: newSwap,
				outcomes: newOutcome,
			}
		}
		| None => {
			{ 
				...storage.bridge,
				swaps: newSwap, 
			}
		}
	};

	let newStorage = {
		...storage,
		bridge: newBridgeStorage,
		token: newTokenStorage,
	};
	(emptyListOfOperations, newStorage)

};