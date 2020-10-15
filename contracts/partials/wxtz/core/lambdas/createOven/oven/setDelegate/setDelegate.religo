#include "./parameter.religo"
let setDelegate = ((setDelegateParameter, storage): (setDelegateParameter, ovenStorage)): (list(operation), ovenStorage) => {
    // TODO: only owner of the wXTZ Vault should be able to call this entrypoint
    let setDelegateOperation = Tezos.set_delegate(setDelegateParameter);
    (
        [setDelegateOperation],
        storage
    );
}