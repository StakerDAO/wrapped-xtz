let redeem = ((redeemParameter, storage): (redeemParameter, storage)): (entrypointReturn, storage) => {
	/**
	 * Provided secret needs to be below a certain length
	 */
	let secretByteLength = Bytes.length(redeemParameter.secret);
	let isLengthBelowThreshold = secretByteLength <= 32n;
	let isLengthBelowThreshold = switch (isLengthBelowThreshold) {
		| true => true
		| false => (failwith(errorTooLongSecret): bool)
	};

	let optionalSecretHash = Big_map.find_opt(redeemParameter.lockId, storage.bridge.outcomes);
	let secretHash = switch (optionalSecretHash) {
		| Some(outcome) => {
			switch (outcome) {
				| HashRevealed(secretHash) => secretHash
				| SecretRevealed(secret) => (failwith(errorSwapAlreadyPerformed): secretHash)
				| Refunded(value) => (failwith(errorSwapAlreadyRefunded): secretHash)
			};
		}
		| None => (failwith(errorHashWasNotRevealed): secretHash)
	};

	let optionalSwapEntry = Big_map.find_opt(redeemParameter.lockId, storage.bridge.swaps);
	let swap = switch (optionalSwapEntry) {
		| Some(swap) => swap
		| None => (failwith(errorSwapLockDoesNotExist): swap)
	};

	/**
	 * Check whether swap time period has expired
	 */
	switch (swap.releaseTime >= Tezos.now) {
		| false => (failwith(errorSwapIsOver): unit)
		| true => unit
	};

	/**
	 * Calculate SHA-256 hash of provided secret
	 */
	let calculatedHash = Crypto.sha256(redeemParameter.secret);

	switch (calculatedHash == secretHash) {
		| false => (failwith(errorInvalidSecret): (entrypointReturn, storage))
		| true => {
			/**
			 * Constructing the transfer parameter to redeem locked-up tokens
			 */
			let transferParameter: transferParameter = {
				to_: swap.to_,
				from_: Tezos.self_address,
				value: swap.value,
			};
			/**
			 * Calling the transfer function to redeem the token amount specified in swap
			 */
			let (_, newTokenStorage) = transfer((transferParameter, storage.token));

			let newOutcome = Big_map.update(
				redeemParameter.lockId,
				Some(SecretRevealed(redeemParameter.secret)),
				storage.bridge.outcomes
			);
	
			let newStorage = {
				...storage,
				token: newTokenStorage, 
				bridge: {
					...storage.bridge,
					outcomes: newOutcome
				}
			};
			(emptyListOfOperations, newStorage);
		};
	};
};