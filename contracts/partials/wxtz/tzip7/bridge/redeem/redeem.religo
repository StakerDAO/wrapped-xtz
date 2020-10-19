let redeem = ((redeemParameter, storage): (redeemParameter, storage)): (list(operation), storage) => {
	/**
	 * Provided secret needs to be below a certain length
	 */
	let secretByteLength = Bytes.length(redeemParameter.secret);
	let islengthBelowThreshold = secretByteLength <= 32n;
	let islengthBelowThreshold = switch (islengthBelowThreshold) {
		| true => true
		| false => (failwith("TooLongSecret"): bool)
	};

	let swap = switch (Big_map.find_opt(redeemParameter.lockId, storage.bridge.swaps)) {
	| Some(swap) => swap
	| None => (failwith("SwapLockDoesNotExist"): swap)
	};

	/**
	 * Check whether swap time period has expired
	 */
	switch (swap.releaseTime >= Tezos.now) {
		| false => (failwith("SwapIsOver"): unit)
		| true => unit
	};

	let secretHash = switch (Big_map.find_opt(redeemParameter.lockId, storage.bridge.outcomes)) {
		| Some(outcome) => {
			switch (outcome) {
			| HashRevealed(secretHash) => secretHash
			| SecretRevealed(secret) => (failwith("SwapAlreadyPerformed"): secretHash)
			| Refunded(value) => (failwith("SwapAlreadyRefunded"): secretHash)
			};
		}
		| None => (failwith("HashWasNotRevealed"): secretHash)
	};
	/**
	 * Calculate SHA-256 hash of provided secret
	 */
	let calculatedHash = Crypto.sha256(redeemParameter.secret);

	switch (calculatedHash == secretHash) {
		| false => (failwith("InvalidSecret"): (list(operation), storage))
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
			(([]: list (operation)), newStorage);
		};
	};
};