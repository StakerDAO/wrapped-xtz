let confirmSwap = ((confirmSwapParameter, bridgeStorage): (confirmSwapParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
    let isPaused = switch (storage.token.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};
    
    let optionalSwapEntry = Big_map.find_opt(confirmSwapParameter.secretHash, bridgeStorage.swaps);
	let swap = switch (optionalSwapEntry) {
		| Some(swap) => swap
		| None => (failwith(errorSwapLockDoesNotExist): swap)
	};

    // check that sender of transaction has permission to confirm the swap
    switch (Tezos.sender == swap.from_) {
        | true => unit
        | false => (failwith("NoPermission"): unit)
    };

    let newSwapEntry = {
        ...swap,
        confirmed: true,
    };

    let newSwaps = Big_map.update(
        confirmSwapParameter.secretHash,
        Some(newSwapEntry),
        bridgeStorage.swaps
    );

    let newBridgeStorage = {
        ...bridgeStorage,
        swaps: newSwaps,
    };

    (emptyListOfOperations, newBridgeStorage)
};