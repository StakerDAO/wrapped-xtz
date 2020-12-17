let getSwap = ((getSwapParameter, bridgeStorage): (getSwapParameter, bridgeStorage)): bridgeEntrypointReturn => {
    // retrieve swap record from bridge storage
    let swapId: swapId = (getSwapParameter.secretHash, getSwapParameter.swapInitiator);
    let swap = getSwapLock(swapId, bridgeStorage.swaps);

    let operation = Tezos.transaction(
        swap,
        0mutez,
        getSwapParameter.callback
    );
    // one operation is returned and storage is not manipulated
    ([operation], bridgeStorage);
};
