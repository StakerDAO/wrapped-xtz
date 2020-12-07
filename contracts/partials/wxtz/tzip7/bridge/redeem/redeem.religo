#include "../helpers/permissions.religo"
#include "../helpers/validators.religo"

let redeem = ((redeemParameter, storage): (redeemParameter, storage)): (entrypointReturn, storage) => {
	// continue only if token operations are not paused
	failIfPaused(storage.token);	
	// provided secret needs to be below a certain length
	failIfSecretTooLong(redeemParameter.secret);
	// calculate SHA-256 hash of provided secret
	let secretHash = Crypto.sha256(redeemParameter.secret);
	// continue only if swap was confirmed
	failIfSwapIsNotConfirmed(secretHash, storage.bridge.swaps);
	// use the calculated hash to retrieve swap record from bridge storage
	let swap = getSwapLock(secretHash, storage.bridge.swaps);
	// check whether swap time period has expired
	failIfSwapIsOver(swap);
	
	// construct the transfer parameter to redeem locked-up tokens
	let totalValue = swap.value + swap.fee;
	let transferParameter: transferParameter = {
		to_: swap.to_,
		from_: Tezos.self_address,
		value: totalValue,
	};
	// calling the transfer function to redeem the total token amount specified in swap
	let ledger = updateLedgerByTransfer(transferParameter, storage.token.ledger);

	// remove swap record from bridge storage
	let swaps = Big_map.remove(
		secretHash,
		storage.bridge.swaps
	);
	// save secret and secretHash to outcomes in bridge storage
	let outcomes = Big_map.add(
		secretHash,
		redeemParameter.secret,
		storage.bridge.outcomes
	);

	// update token ledger storage and bridge storage
	let storage = {
		...storage,
		token: {
			...storage.token,
			ledger: ledger,
		}, 
		bridge: {
			...storage.bridge,
			swaps: swaps,
			outcomes: outcomes,
		}
	};
	// no operations are returned, only the updated storage
	(emptyListOfOperations, storage);
};