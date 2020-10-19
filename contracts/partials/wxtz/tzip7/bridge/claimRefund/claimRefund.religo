let claimRefund = ((claimRefundParameter, storage): (claimRefundParameter, storage)): (list(operation), storage) => {
    let swap = switch (Big_map.find_opt(claimRefundParameter.lockId, storage.bridge.swaps)) {
        | Some(swap) => swap
        | None => (failwith("SwapLockDoesNotExist"): swap)
    };
    
	/**
	 * Check whether swap time condition is met
	 */
	switch (swap.releaseTime <= Tezos.now) {
		| true => unit
		| false => (failwith("FundsLock"): unit)
	};

    let secretHash = switch (Big_map.find_opt(claimRefundParameter.lockId, storage.bridge.outcomes)) {
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
     * Constructing the transfer parameter to redeem locked-up tokens
        */
    let transferParameter: transferParameter = {
        to_: swap.from_,
        from_: Tezos.self_address,
        value: swap.value,
    };
    /**
     * Calling the transfer function to redeem the token amount specified in swap
    */
    let (_, newTokenStorage) = transfer((transferParameter, storage.token));

    let newOutcome = Big_map.update(
        claimRefundParameter.lockId,
        Some(Refunded),
        storage.bridge.outcomes
    );

    let newStorage = {
        ...storage,
        token: newTokenStorage, 
        bridge: {
            ...storage.bridge,
            outcomes: newOutcome
        },
    };
    (([]: list (operation)), newStorage);
};