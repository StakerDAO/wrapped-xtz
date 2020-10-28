let redeem = ((redeemParameter, storage): (redeemParameter, storage)): (entrypointReturn, storage) => {
	// provided secret needs to be below a certain length
	let secretByteLength = Bytes.length(redeemParameter.secret);
	let isLengthBelowThreshold: bool = secretByteLength <= 32n;
	switch (isLengthBelowThreshold) {
		| true => unit
		| false => (failwith(errorTooLongSecret): unit)
	};

	// calculate SHA-256 hash of provided secret
	let secretHash = Crypto.sha256(redeemParameter.secret);

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

	switch (swap.confirmed) {
		| true => unit
		| false => (failwith(errorSwapIsNotConfirmed): unit)
	};

	// constructing the transfer parameter to redeem locked-up tokens
	let totalValue = switch(swap.fee) {
		| Some(fee) => swap.value + fee;
		| None => swap.value
	};
	
	let transferParameter: transferParameter = {
		to_: swap.to_,
		from_: Tezos.self_address,
		value: totalValue,
	};
	// calling the transfer function to redeem the token amount specified in swap
	let (_, newTokenStorage) = transfer((transferParameter, storage.token));

	// saving secret and secretHash to outcomes
	let newOutcome = Big_map.add(
		secretHash,
		redeemParameter.secret,
		storage.bridge.outcomes
	);

	let newSwap = Big_map.remove(
		secretHash,
		storage.bridge.swaps
	);

	let newStorage = {
		...storage,
		token: newTokenStorage, 
		bridge: {
			...storage.bridge,
			swaps: newSwap,
			outcomes: newOutcome
		}
	};
	(emptyListOfOperations, newStorage);
};