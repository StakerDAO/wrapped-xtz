let lock = ((lockParameter, storage): (lockParameter, storage)): (entrypointReturn, storage) => {
	let swapEntry: swap = {
		confirmed: lockParameter.confirmed,
		fee: lockParameter.fee,
		from_: Tezos.sender,
		releaseTime: lockParameter.releaseTime,
		secretHash: lockParameter.secretHash,
		to_: lockParameter.to_,
		value: lockParameter.value,
	};
	let newSwap = Big_map.find_opt(lockParameter.secretHash, storage.bridge.swaps);
	let newSwap = switch (newSwap) {
		| Some(value) => (failwith(errorSwapLockAlreadyExists): swaps)
		| None => {
			Big_map.add(
				lockParameter.secretHash,
				swapEntry,
				storage.bridge.swaps
			);
		}
	};


	let totalAmount = switch (lockParameter.fee) {
		| Some(fee) => lockParameter.value + fee
		| None => lockParameter.value
	};
	
	let transferParameter: transferParameter = {
		from_: Tezos.sender,
		to_:  Tezos.self_address,
		value: totalAmount,
	};

	let (_, newTokenStorage) = transfer((transferParameter, storage.token));

	let newBridgeStorage = { 
		...storage.bridge,
		swaps: newSwap, 
	};

	let newStorage = {
		...storage,
		bridge: newBridgeStorage,
		token: newTokenStorage,
	};
	(emptyListOfOperations, newStorage)

};