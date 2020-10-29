let getSwap = ((getSwapParameter, bridgeStorage): (getSwapParameter, bridgeStorage)): (entrypointReturn, bridgeStorage) => {
	let swap = Big_map.find_opt(
		getSwapParameter.secretHash,
		bridgeStorage.swaps
	);
	let swap = switch (swap) {
		| Some(value) => value
		| None => (failwith("errorSwapLockDoesNotExist"): swap)
	};
	let op = Tezos.transaction(
		swap,
		0mutez,
		getSwapParameter.callback
	);
	([op], bridgeStorage)
};