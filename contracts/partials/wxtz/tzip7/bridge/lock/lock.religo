let failIfSwapLockExists = ((secretHash, swaps): (secretHash, swaps)): unit => {
	let existingSwap = Big_map.find_opt(secretHash, swaps);
	switch(existingSwap) {
		| Some(swap) => (failwith(errorSwapLockAlreadyExists): unit)
		| None => unit
	};
};

let setSwap = ((secretHash, swap, swaps): (secretHash, swap, swaps)): swaps => {
	failIfSwapLockExists(secretHash, swaps);
	Big_map.add(
		secretHash,
		swap,
		swaps
	);
};

let lock = ((lockParameter, storage): (lockParameter, storage)): entrypointReturn => {
	// continue only if token operations are not paused
	failIfPaused(storage.token);
	// check for existing swap lock
	failIfSwapLockExists(lockParameter.secretHash, storage.bridge.swaps);
	
	// create swap record entry from parameters and implicit values
	let swap: swap = {
		confirmed: lockParameter.confirmed,
		fee: lockParameter.fee,
		releaseTime: lockParameter.releaseTime,
		to_: lockParameter.to_,
		value: lockParameter.value,
		from_: Tezos.sender,
	};
	// save new swap record with secretHash as key
	let swaps = setSwap(lockParameter.secretHash, swap, storage.bridge.swaps);
	
	// lock up total swap amount, by transferring it to the smart contracts own address
	let lockValue = lockParameter.value + lockParameter.fee;
	let transferParameter: transferParameter = {
		from_: Tezos.sender,
		to_:  storage.bridge.lockSaver,
		value: lockValue,
	};
	// call the transfer function of TZIP-7
	let ledger = updateLedgerByTransfer(transferParameter, storage.token.ledger);
	
	// update  and token storage
	let storage = {
		...storage,
		bridge: {
			...storage.bridge,
			swaps: swaps,
		},
		token: {
			...storage.token,
			ledger: ledger,
		},
	};
	// no operations are returned, only the updated storage
	(emptyListOfOperations, storage);
};