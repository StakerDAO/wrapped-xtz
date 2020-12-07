#include "../helpers/permissions.religo"
#include "../helpers/validators.religo"

let claimRefund = ((claimRefundParameter, storage): (claimRefundParameter, storage)): (entrypointReturn, storage) => {
	// continue only if token operations are not paused
	failIfPaused(storage.token);   
    // check that sender of transaction has permission to confirm the swap
    failIfSenderIsNotTheInitiator(claimRefundParameter.secretHash, storage.bridge.swaps);
    
    // retrieve swap record from storage
    let swap = getSwapLock(claimRefundParameter.secretHash, storage.bridge.swaps);
	// check for swap protocol time condition
    failIfSwapIsNotOver(swap);

    // constructing the transfer parameter to redeem locked-up tokens
    let transferValueParameter: transferParameter = {
        to_: swap.from_,
        value: swap.value,
        from_: storage.bridge.lockSaver,
    };
    // calling the transfer function to redeem the token amount specified in swap
    let ledger = updateLedgerByTransfer(transferValueParameter, storage.token.ledger);

    // constructing the transfer parameter to send the fee regardless of failed swap to the recipient
    let transferFeeParameter: transferParameter = {
        to_: swap.to_,
        value: swap.fee,
        from_: storage.bridge.lockSaver,
    };
    // please note that the modified ledger storage from above is used here
    let ledger = updateLedgerByTransfer(transferFeeParameter, ledger);
    
    // remove the swap record from storage
    let swaps = Big_map.remove(claimRefundParameter.secretHash, storage.bridge.swaps);

    // update both token ledger storage and swap records in bridge storage
    let newStorage = {
        ...storage,
        token: {
            ...storage.token,
            ledger: ledger
        }, 
        bridge: {
            ...storage.bridge,
            swaps: swaps,
        },
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, newStorage);
};