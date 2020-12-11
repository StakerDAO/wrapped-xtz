let lock = ((lockParameter, storage): (lockParameter, storage)): (entrypointReturn, storage) => {
	// continue only if token operations are not paused
	failIfPaused(storage.token);
	
	// create swap record entry from parameters and implicit values
	let swapEntry: swap = {
		confirmed: lockParameter.confirmed,
		fee: lockParameter.fee,
		from_: Tezos.sender,
		releaseTime: lockParameter.releaseTime,
		to_: lockParameter.to_,
		value: lockParameter.value,
	};
	// save new swap record as value for the secretHash key, but only if is not already taken
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
	
	// lock up total swap amount, by transferring it to the smart contracts own address
	let totalAmount = lockParameter.value + lockParameter.fee;
	let transferParameter: transferParameter = {
		from_: Tezos.sender,
		to_:  Tezos.self_address,
		value: totalAmount,
	};
	// call the transfer function of TZIP-7
	let tokenStorage = updateLedgerByTransfer(transferParameter, storage.token);
	
	// update both bridge and token ledger storage
	let newBridgeStorage = { 
		...storage.bridge,
		swaps: newSwap, 
	};
	let newStorage = {
		...storage,
		bridge: newBridgeStorage,
		token: tokenStorage,
	};
	// no operations are returned, only the updated storage
	(emptyListOfOperations, newStorage);
};