#include "../helpers/permissions.religo"
#include "../helpers/validators.religo"

let redeem = ((redeemParameter, storage): (redeemParameter, storage)): entrypointReturn => {
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
    let swaps = removeSwapLock(secretHash, storage.bridge.swaps);
    // save secret and secretHash to outcomes in bridge storage
    let outcomes = Big_map.add(
        secretHash,
        redeemParameter.secret,
        storage.bridge.outcomes
    );

    // update token ledger storage and bridge storage
    let storage = {
        ...storage,
        token: tokenStorage, 
        bridge: {
            ...storage.bridge,
            swaps: swaps,
            outcomes: outcomes,
        },
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, storage);
};
