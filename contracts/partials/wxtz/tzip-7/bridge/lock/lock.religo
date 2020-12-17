#include "../helpers/permissions.religo"
#include "../helpers/validators.religo"

let lock = ((lockParameter, storage): (lockParameter, storage)): entrypointReturn => {
	// continue only if token operations are not paused
	failIfPaused(storage.token);
	// check for existing swap lock
	failIfSwapLockExists(lockParameter.secretHash, storage.bridge.swaps);
    // check that swap time input is in the future
    failIfInvalidSwapTimeInput(lockParameter.releaseTime);
	
	// create swap record entry from parameters and implicit values
	let swap: swap = {
		confirmed: lockParameter.confirmed,
		fee: lockParameter.fee,
		releaseTime: lockParameter.releaseTime,
		to_: lockParameter.to_,
		value: lockParameter.value,
		from_: Tezos.sender,
	};
	// save new swap record with secretHash as key
	let swaps = setNewSwapLock(
        lockParameter.secretHash,
        swap,
        storage.bridge.swaps
    );
	
	// lock up total swap amount, by transferring it to the smart contracts own address
	let lockValue = lockParameter.value + lockParameter.fee;
	let transferParameter: transferParameter = {
		from_: Tezos.sender,
		to_:  storage.bridge.lockSaver,
		value: lockValue,
	};
	// call the transfer function of TZIP-7
	let tokenStorage = updateLedgerByTransfer(transferParameter, storage.token);
	
	// update  and token storage
	let storage = {
		...storage,
		bridge: {
			...storage.bridge,
			swaps: swaps,
		},
		token: tokenStorage,
	};
	// no operations are returned, only the updated storage
	(emptyListOfOperations, storage);
};
