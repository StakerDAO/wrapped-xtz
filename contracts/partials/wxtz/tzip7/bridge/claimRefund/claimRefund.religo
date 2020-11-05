let claimRefund = ((claimRefundParameter, storage): (claimRefundParameter, storage)): (entrypointReturn, storage) => {
    // continue only if token operations are not paused
    let isPaused = switch (storage.token.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};
    
    // retrieve swap record from storage
    let swap = Big_map.find_opt(claimRefundParameter.secretHash, storage.bridge.swaps);
    let swap = switch (swap) {
        | Some(swap) => swap
        | None => (failwith(errorSwapLockDoesNotExist): swap)
    };

	// check for swap protocol time condition
	switch (swap.releaseTime <= Tezos.now) {
		| true => unit
		| false => (failwith(errorFundsLock): unit)
	};

    // constructing the transfer parameter to redeem locked-up tokens
    let transferValueParameter: transferParameter = {
        to_: swap.from_,
        from_: Tezos.self_address,
        value: swap.value,
    };
    // calling the transfer function to redeem the token amount specified in swap
    let (_, newTokenStorage) = transfer((transferValueParameter, storage.token));

    // constructing the transfer parameter to send the fee regardless of failed swap to the recipient
    let transferFeeParameter: transferParameter = {
        to_: swap.to_,
        from_: Tezos.self_address,
        value: swap.fee,
    };
    // please note that the modified newTokenStorage from above is used here
    let (_, newTokenStorage) = transfer(transferFeeParameter, newTokenStorage);
    
    // remove the swap record from storage
    let newSwaps = Big_map.remove(claimRefundParameter.secretHash, storage.bridge.swaps);

    // update both token ledger storage and swap records in bridge storage
    let newStorage = {
        ...storage,
        token: newTokenStorage, 
        bridge: {
            ...storage.bridge,
            swaps: newSwaps,
        },
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, newStorage);
};