#include "./parameter.religo"
#include "../../../onOvenSetDelegate/onOvenSetDelegateInit.religo"

let setDelegate = ((setDelegateParameter, storage): (setDelegateParameter, ovenStorage)): (list(operation), ovenStorage) => {
    let coreContractAddress: address = storage.coreAddress;
    let onOvenSetDelegateParameter: onOvenSetDelegateParameter = Tezos.sender;

    let coreRunEntrypointLambdaParameter: runEntrypointLambdaParameter = {
        lambdaName: "onOvenSetDelegate",
        lambdaParameter: Bytes.pack(onOvenSetDelegateParameter)
    };

    let coreContractOnSetDelegateOperation = composeRunEntrypointLambdaOperation((
        coreRunEntrypointLambdaParameter,
        Tezos.amount, // TODO: should the Tezos.amount > 1 be rejected right away or should the hook logic do it?
        coreContractAddress
    ));

    let setDelegateOperation = Tezos.set_delegate(setDelegateParameter);

    (
        [
            coreContractOnSetDelegateOperation,
            setDelegateOperation
        ],
        storage
    );
}