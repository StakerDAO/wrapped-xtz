#include "../helpers/permissions.religo"

[@inline] let transfer = ((transferParameter, tokenStorage): (transferParameter, tokenStorage)): tokenEntrypointReturn => {
    // continue only if token operations are not paused
    failIfPaused(tokenStorage);
    // check for enough balance or allowance
    let transferSpender = Tezos.sender;
    canTransfer(transferSpender, transferParameter, tokenStorage);
    /**
    * If spender of transfer is not the owner of the tokens to be transferred, check for approved allowances in token storage.
    * In case an allowance needs to be used, reduce the allowance by the amount of tokens to be transferred.
    */
    let transferSpenderIsOwner = transferSpender == transferParameter.from_;
    let tokenStorage = switch (transferSpenderIsOwner) {
        | true => tokenStorage // do nothing
        | false => updateApprovalsByTransfer(
            transferParameter,
            transferSpender,
            tokenStorage
        )
    };
    // update balances of sender and receiver according to the amount to be transferred
    let tokenStorage = updateLedgerByTransfer(transferParameter, tokenStorage);
    // no operations are returned, only the updated token storage
    (emptyListOfOperations, tokenStorage);
};
