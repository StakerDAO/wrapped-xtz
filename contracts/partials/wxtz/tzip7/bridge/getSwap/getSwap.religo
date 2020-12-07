let getSwap = ((getSwapParameter, bridgeStorage): (getSwapParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
	// retrieve swap record from bridge storage
	let swap = getSwapLock(getSwapParameter.secretHash, bridgeStorage.swaps);

	let operation = Tezos.transaction(
		swap,
		0mutez,
		getSwapParameter.callback
	);
	// one operation is returned and storage is not manipulated
	([operation], bridgeStorage);
};