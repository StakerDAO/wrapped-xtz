#include "../helpers/permissions.religo"

let confirmSwap = ((confirmSwapParameter, bridgeStorage): (confirmSwapParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
    // confirm swap transaction ignores paused token operations
    
    // check that sender of transaction has permission to confirm the swap
    failIfSenderIsNotTheInitiator(confirmSwapParameter.secretHash, bridgeStorage.swaps);
    // check if swap was already confirmed
    failIfSwapIsAlreadyConfirmed(confirmSwapParameter.secretHash, bridgeStorage.swaps);
    // retrieve swap record from storage
    let swap = getSwapLock(confirmSwapParameter.secretHash, bridgeStorage.swaps);

    // change confirmed value to true in swap record
    let swap = {
        ...swap,
        confirmed: true,
    };
    // update swap record in bridge storage
    let swaps = Big_map.update(
        confirmSwapParameter.secretHash,
        Some(swap),
        bridgeStorage.swaps
    );
    let newBridgeStorage = {
        ...bridgeStorage,
        swaps: swaps,
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, newBridgeStorage);
};