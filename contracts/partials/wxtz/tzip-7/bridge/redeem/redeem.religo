let redeem = ((redeemParameter, storage): (redeemParameter, storage)): entrypointReturn => {
    // continue only if token operations are not paused
    failIfPaused(storage.token);	
    // provided secret needs to be 32 bytes long
    failIfInvalidSecretLength(redeemParameter.secret);
    // calculate SHA-256 hash of provided secret
    let secretHash = Crypto.sha256(redeemParameter.secret);
    // continue only if swap was confirmed
    let swapId: swapId = (secretHash, redeemParameter.swapInitiator);
    failIfSwapIsNotConfirmed(swapId, storage.bridge.swaps);
    // use the calculated hash to retrieve swap record from bridge storage with the swapId
    let swap = getSwapLock(swapId, storage.bridge.swaps);

    // construct the transfer parameter to redeem locked-up tokens
    let totalValue = swap.value + swap.fee;
    let transferParameter: transferParameter = {
        to_: swap.to_,
        from_: storage.bridge.lockSaver,
        value: totalValue,
    };
    // calling the transfer function to redeem the total token amount specified in swap
    let tokenStorage = updateLedgerByTransfer(transferParameter, storage.token);

    // remove swap record from bridge storage
    let bridgeStorage = removeSwapLock(swapId, storage.bridge);
    // save secret and secretHash as outcome in bridge storage
    let bridgeStorage = setOutcome(secretHash, redeemParameter.secret, bridgeStorage);

    // update token ledger storage and bridge storage
    let storage = {
        ...storage,
        token: tokenStorage, 
        bridge: bridgeStorage,
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, storage);
};
