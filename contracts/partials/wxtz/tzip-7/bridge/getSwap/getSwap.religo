let getSwap = ((getSwapParameter, bridgeStorage): (getSwapParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
	// retrieve swap record from bridge storage
	let swap = Big_map.find_opt(
		getSwapParameter.secretHash,
		bridgeStorage.swaps
	);
	let swap = switch (swap) {
		| Some(value) => value
		| None => (failwith(errorSwapLockDoesNotExist): swap)
	};
	let operation = Tezos.transaction(
		swap,
		0mutez,
		getSwapParameter.callback
	);
	// one operation is returned and storage is not manipulated
	([operation], bridgeStorage);
};