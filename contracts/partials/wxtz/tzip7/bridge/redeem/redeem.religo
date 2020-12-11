let redeem = ((redeemParameter, storage): (redeemParameter, storage)): (entrypointReturn, storage) => {
	// continue only if token operations are not paused
	failIfPaused(storage.token);
	
	// provided secret needs to be below a certain length
	let secretByteLength = Bytes.length(redeemParameter.secret);
	let isLengthBelowThreshold: bool = secretByteLength <= 32n;
	switch (isLengthBelowThreshold) {
		| true => unit
		| false => (failwith(errorTooLongSecret): unit)
	};

	// calculate SHA-256 hash of provided secret
	let secretHash = Crypto.sha256(redeemParameter.secret);

	// use the calculated hash to retrieve swap record from bridge storage
	let swap = Big_map.find_opt(secretHash, storage.bridge.swaps);
	let swap = switch (swap) {
		| Some(swap) => swap
		| None => (failwith(errorSwapLockDoesNotExist): swap)
	};

	// check whether swap time period has expired
	switch (swap.releaseTime >= Tezos.now) {
		| false => (failwith(errorSwapIsOver): unit)
		| true => unit
	};

	// continue only if swap was confirmed
	switch (swap.confirmed) {
		| true => unit
		| false => (failwith(errorSwapIsNotConfirmed): unit)
	};

	// construct the transfer parameter to redeem locked-up tokens
	let totalValue = swap.value + swap.fee;
	let transferParameter: transferParameter = {
		to_: swap.to_,
		from_: Tezos.self_address,
		value: totalValue,
	};

	// calling the transfer function to redeem the total token amount specified in swap
	let tokenStorage = updateLedgerByTransfer(transferParameter, storage.token);

	// save secret and secretHash to outcomes in bridge storage
	let newOutcome = Big_map.add(
		secretHash,
		redeemParameter.secret,
		storage.bridge.outcomes
	);

	// remove swap record from bridge storage
	let newSwap = Big_map.remove(
		secretHash,
		storage.bridge.swaps
	);

	// update token ledger storage and bridge storage
	let newStorage = {
		...storage,
		token: tokenStorage, 
		bridge: {
			...storage.bridge,
			swaps: newSwap,
			outcomes: newOutcome,
		}
	};
	// no operations are returned, only the updated storage
	(emptyListOfOperations, newStorage);
};