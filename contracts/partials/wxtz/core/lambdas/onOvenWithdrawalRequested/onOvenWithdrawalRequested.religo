/**
 * Lambda used to allow/deny withdrawal calls from the wXTZ Oven.
 * Also responsible for burning wXTZ equivalent to the amount of XTZ withdrawn.
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    let onOvenWithdrawalRequestedParameter: option(onOvenWithdrawalRequestedParameter) = Bytes.unpack(lambdaParameter);
    let onOvenWithdrawalRequestedParameter: onOvenWithdrawalRequestedParameter = switch (onOvenWithdrawalRequestedParameter) {
        | None => failwith(errorLambdaParameterWrongType): onOvenWithdrawalRequestedParameter
        | Some(onOvenWithdrawalRequestedParameter) => onOvenWithdrawalRequestedParameter
    };
    
    let (_, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/permissions/isOvenOwner",
        lambdaParameter: Bytes.pack({
            oven: Tezos.sender,
            owner: onOvenWithdrawalRequestedParameter.sender
        })
    }, storage));

    let ovenOwner: option(address) = Big_map.find_opt(Tezos.sender, storage.ovens);
    let ovenOwner: address = switch (ovenOwner) {
        | None => (failwith(errorOvenNotFound): address)
        | Some(ovenOwner) => ovenOwner
    };

    let value = onOvenWithdrawalRequestedParameter.value;
    let (burnWXTZOperationList, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/composeBurnOperation",
        lambdaParameter: Bytes.pack({
            from_: ovenOwner,
            value: value
        })
    }, storage));

    let operations = burnWXTZOperationList;
    if (Tezos.amount > 0mutez) { // TODO: extract
        (failwith(errorAmountNotZero): entrypointReturn)
    } else {
        (operations, storage);
    }
}
