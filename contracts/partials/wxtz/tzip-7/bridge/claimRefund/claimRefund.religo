#include "../helpers/permissions.religo"
#include "../helpers/validators.religo"

let claimRefund = ((claimRefundParameter, storage): (claimRefundParameter, storage)): entrypointReturn => {
	// continue only if token operations are not paused
	failIfPaused(storage.token);   

    let swapInitiator = Tezos.sender;
    let swapId: swapId = (claimRefundParameter.secretHash, swapInitiator);
    // check that sender of transaction has permission to confirm the swap
    failIfSenderIsNotTheInitiator(swapId, storage.bridge.swaps);
    
    // retrieve swap record from storage
    let swap = getSwapLock(swapId, storage.bridge.swaps);
	// check for swap protocol time condition
    failIfSwapIsNotOver(swap);

    // constructing the transfer parameter to redeem locked-up tokens
    let transferValueParameter: transferParameter = {
        to_: swap.from_,
        value: swap.value,
        from_: storage.bridge.lockSaver,
    };
    // calling the transfer function to redeem the token amount specified in swap
    let tokenStorage = updateLedgerByTransfer(transferValueParameter, storage.token);

    // constructing the transfer parameter to send the fee regardless of failed swap to the recipient
    let transferFeeParameter: transferParameter = {
        to_: swap.to_,
        value: swap.fee,
        from_: storage.bridge.lockSaver,
    };
    // please note that the modified token storage from above is used here
    let tokenStorage = updateLedgerByTransfer(transferFeeParameter, tokenStorage);
    
    // remove the swap record from storage
    let bridgeStorage = removeSwapLock(swapId, storage.bridge);

    // update both token ledger storage and swap records in bridge storage
    let storage = {
        ...storage,
        token: tokenStorage, 
        bridge: bridgeStorage,
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, storage);
};
