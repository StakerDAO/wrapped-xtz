let confirmSwap = ((confirmSwapParameter, bridgeStorage): (confirmSwapParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
    // confirm swap transaction ignores paused token operations

    // retrieve swap record from storage
    let swap = Big_map.find_opt(confirmSwapParameter.secretHash, bridgeStorage.swaps);
	let swap = switch (swap) {
		| Some(swap) => swap
		| None => (failwith(errorSwapLockDoesNotExist): swap)
	};

    // check that sender of transaction has permission to confirm the swap
    switch (Tezos.sender == swap.from_) {
        | true => unit
        | false => (failwith(errorNoPermission): unit)
    };

    // change confirmed value to true in swap record
    let newSwapEntry = {
        ...swap,
        confirmed: true,
    };
    // update swap record in bridge storage
    let newSwaps = Big_map.update(
        confirmSwapParameter.secretHash,
        Some(newSwapEntry),
        bridgeStorage.swaps
    );
    let newBridgeStorage = {
        ...bridgeStorage,
        swaps: newSwaps,
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, newBridgeStorage);
};
