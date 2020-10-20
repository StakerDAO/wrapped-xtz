let lock = ((lockParameter, storage): (lockParameter, storage)) : (list(operation), storage) => {
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
	 */
	 switch (lockParameter.secretHash) {
		| Some(secretHash) => {
			/**
			 * Hash was revealed and is saved to outcomes
			 * New swap is saved to storage
			 * Tokens to be transferred are locked
			 */
			let newOutcome = Big_map.add(
				lockParameter.lockId,
				HashRevealed(secretHash),
				storage.bridge.outcomes
			);
			let newStorage = { 
				...storage, 
				bridge: { 
					...storage.bridge,
					swaps: newSwap,
					outcomes: newOutcome,
				}, 
				token: newTokenStorage,
			};			
			(([]: list (operation)), newStorage);
		}
		| None => {
			/**
			 * No secret hash was revealed
			 * New swap is saved to storage
			 * Tokens to be transferred are locked
			 */
			let newStorage = { 
				...storage, 
				bridge: { 
					...storage.bridge,
					swaps: newSwap, 
				},
				token: newTokenStorage,
			};
			(([]: list(operation)), newStorage);
		}
	};

};