/**
 * Lambda used to allow/deny updating of the oven delegate based on oven ownership.
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    let onOvenSetDelegateParameter: option(onOvenSetDelegateParameter) = Bytes.unpack(lambdaParameter);
    let onOvenSetDelegateParameter: onOvenSetDelegateParameter = switch (onOvenSetDelegateParameter) {
        | None => failwith(errorLambdaParameterWrongType): onOvenSetDelegateParameter
        | Some(onOvenSetDelegateParameter) => onOvenSetDelegateParameter
    };
    
    let (_, _, _) = runArbitraryValueLambda((
        {
            lambdaName: "arbitrary/permissions/isOvenOwner",
            lambdaParameter: Bytes.pack({
                oven: Tezos.sender,
                owner: onOvenSetDelegateParameter
            })
        }, 
        storage,
        lambdaExtras
    ));

    if (Tezos.amount > 0mutez) { // TODO: extract
        (failwith(errorAmountNotZero): entrypointReturn)
    } else {
        ([]: list(operation), storage);
    }
}
