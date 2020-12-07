#include "../errors.religo"

let getSwapLock = ((secretHash, swaps): (secretHash, swaps)): swap => {
    let swap = Big_map.find_opt(secretHash, swaps);
	switch (swap) {
		| Some(swap) => swap
		| None => (failwith(errorSwapLockDoesNotExist): swap)
	};
};

let setSwapLock = ((secretHash, swap, swaps): (secretHash, swap, swaps)): swaps => {
	Big_map.add(
		secretHash,
		swap,
		swaps
	);
};

// the logic is different to getSwapLock
let failIfSwapLockExists = ((secretHash, swaps): (secretHash, swaps)): unit => {
	let existingSwap = Big_map.find_opt(secretHash, swaps);
	switch(existingSwap) {
		| Some(swap) => (failwith(errorSwapLockAlreadyExists): unit)
		| None => unit
	};
};

let setNewSwapLock = ((secretHash, swap, swaps): (secretHash, swap, swaps)): swaps => {
	failIfSwapLockExists(secretHash, swaps);
	setSwapLock(secretHash, swap, swaps);
};

let removeSwapLock = ((secretHash, swaps): (secretHash, swaps)): swaps => {
	Big_map.remove(secretHash, swaps);
};

let updateSwapLock = ((secretHash, swap, swaps): (secretHash, swap, swaps)): swaps => {
    Big_map.update(
        secretHash,
        Some(swap),
        swaps
    );
};