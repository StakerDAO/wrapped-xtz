let claimRefund = ((claimRefundParameter, storage): (claimRefundParameter, storage)): (entrypointReturn, storage) => {
    let swap = switch (Big_map.find_opt(claimRefundParameter.secretHash, storage.bridge.swaps)) {
        | Some(swap) => swap
        | None => (failwith(errorSwapLockDoesNotExist): swap)
    };
    
	// swap protocol time condition
	switch (swap.releaseTime <= Tezos.now) {
		| true => unit
		| false => (failwith(errorFundsLock): unit)
	};

    // TODO check with Serokell whether the specification was followed
    // switch (Tezos.sender == swap.from_ || Tezos.sender == swap.to_) {
    //     | true => unit
    //     | false => (failwith(errorNoPermission): unit)
    // };
    
    // constructing the transfer parameter to redeem locked-up tokens
    let transferValueParameter: transferParameter = {
        to_: swap.from_,
        from_: Tezos.self_address,
        value: swap.value,
    };
    // calling the transfer function to redeem the token amount specified in swap
    let (_, newTokenStorage) = transfer((transferValueParameter, storage.token));

    let (_, newTokenStorage) = switch(swap.fee) {
        | Some(fee) => {
            // constructing the transfer parameter to send the fee regardless of failed swap to the recipient
            let transferFeeParameter: transferParameter = {
            to_: swap.to_,
            from_: Tezos.self_address,
            value: fee,
            };
            // calling the transfer function to send the swap fee to the recipient
            transfer(transferFeeParameter, newTokenStorage);
        }
        | None => (emptyListOfOperations, newTokenStorage)
    };
    
    // remove the swap record
    let newSwaps = Big_map.remove(swap.secretHash, storage.bridge.swaps);

    let newStorage = {
        ...storage,
        token: newTokenStorage, 
        bridge: {
            ...storage.bridge,
            swaps: newSwaps,
        },
    };
    (emptyListOfOperations, newStorage);
};