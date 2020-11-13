((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    // decompose the parameter
    let simpleEntrypointLambdaParameter: option(nat) = Bytes.unpack(lambdaParameter);
    let simpleEntrypointLambdaParameter = switch(simpleEntrypointLambdaParameter) {
        | None => failwith(errorLambdaParameterWrongType): simpleEntrypointLambdaParameter
        | Some(simpleEntrypointLambdaParameter) => simpleEntrypointLambdaParameter
    };

    // update storage for testing purposes
    let arbitraryValues = Big_map.update(
        "simpleEntrypointLambda",
        Some(Bytes.pack(simpleEntrypointLambdaParameter)),
        storage.arbitraryValues
    );

    // send back all the XTZ received
    let recipient = switch(Tezos.get_contract_opt(Tezos.sender): option(contract(unit))) {
        | None => failwith("sender does not accept transfers"): contract(unit)
        | Some(recipient) => recipient
    };
    let testOperation = Tezos.transaction(
        (),
        Tezos.amount,
        recipient
    );

    (
        [testOperation], 
        {
            ...storage,
            arbitraryValues: arbitraryValues
        }
    );
}