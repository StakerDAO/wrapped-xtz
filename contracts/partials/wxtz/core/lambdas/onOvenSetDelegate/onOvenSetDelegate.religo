/**
 * Lambda used to allow/deny updating of the oven delegate based on oven ownership.
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    let (_, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/permissions/isOvenOwner",
        lambdaParameter: Bytes.pack({
            oven: Tezos.sender,
            owner: Tezos.source
        })
    }, storage));

    if (Tezos.amount > 0mutez) { // TODO: extract
        (failwith(errorAmountNotZero): entrypointReturn)
    } else {
        ([]: list(operation), storage);
    }
}