#include "../errors.religo"

let getSwapLock = ((swapId, swaps): (swapId, swaps)): swap => {
    let swap = Big_map.find_opt(swapId, swaps);
	switch (swap) {
		| Some(swap) => swap
		| None => (failwith(errorSwapLockDoesNotExist): swap)
	};
};

let setSwapLock = ((swapId, swap, swaps): (swapId, swap, swaps)): swaps => {
	Big_map.add(
		swapId,
		swap,
		swaps
	);
};

// the logic is different to getSwapLock
let failIfSwapLockExists = ((swapId, swaps): (swapId, swaps)): unit => {
	let existingSwap = Big_map.find_opt(swapId, swaps);
	switch(existingSwap) {
		| Some(swap) => (failwith(errorSwapLockAlreadyExists): unit)
		| None => unit
	};
};

let setNewSwapLock = ((swapId, swap, swaps): (swapId, swap, swaps)): swaps => {
	failIfSwapLockExists(swapId, swaps);
	setSwapLock(swapId, swap, swaps);
};

let removeSwapLock = ((swapId, bridgeStorage): (swapId, bridgeStorage)): bridgeStorage => {
	let swaps = Big_map.remove(swapId, bridgeStorage.swaps);
    let bridgeStorage = {
        ...bridgeStorage,
        swaps: swaps,
    };
    bridgeStorage;
};

let updateSwapLock = ((swapId, swap, swaps): (swapId, swap, swaps)): swaps => {
    Big_map.update(
        swapId,
        Some(swap),
        swaps
    );
};
