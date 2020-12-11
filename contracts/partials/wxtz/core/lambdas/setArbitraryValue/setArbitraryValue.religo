/**
 * This entrypoint can be used by the admin 
 * to upsert any arbitrary values.
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    let (_, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/permissions/isAdmin",
        lambdaParameter: Bytes.pack(Tezos.sender)
    }, storage));

    let setArbitraryValueParameter: option(setArbitraryValueParameter) = Bytes.unpack(lambdaParameter);
    let setArbitraryValueParameter = switch (setArbitraryValueParameter) {
        | None => (failwith(errorLambdaParameterWrongType): setArbitraryValueParameter)
        | Some(setArbitraryValueParameter) => setArbitraryValueParameter
    };

    let storage = setArbitraryValue(
        setArbitraryValueParameter.arbitraryValueKey,
        setArbitraryValueParameter.arbitraryValue,
        storage
    );

    ([]: list(operation), storage)
}