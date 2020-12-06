let getTokenSwap = ((secretHash, swaps): (secretHash, swaps)): swap => {
    let swap = Big_map.find_opt(secretHash, swaps);
	switch (swap) {
		| Some(swap) => swap
		| None => (failwith(errorSwapLockDoesNotExist): swap)
	};
};