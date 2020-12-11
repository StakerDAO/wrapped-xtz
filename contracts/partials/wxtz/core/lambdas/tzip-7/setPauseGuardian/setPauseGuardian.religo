((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    let (_, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/permissions/isAdmin",
        lambdaParameter: Bytes.pack(Tezos.sender)
    }, storage));

    let setPauseGuardianParameter: option(setPauseGuardianParameter) = Bytes.unpack(lambdaParameter);
    let setPauseGuardianParameter: setPauseGuardianParameter = switch (setPauseGuardianParameter) {
        | None => (failwith(errorLambdaParameterWrongType): setPauseGuardianParameter)
        | Some(setPauseGuardianParameter) => setPauseGuardianParameter
    };

    let wXTZTokenContractAddress: address = getWXTZTokenContractAddress(storage);

    /**
     * This piece of code could be abstracted if `get_contract_opt` 
     * was used and a full contract parameter passed instead.
     */
    let wXTZTokenContract: option(contract(setPauseGuardianParameter)) = Tezos.get_entrypoint_opt("%setPauseGuardian", wXTZTokenContractAddress);
    let wXTZTokenContract: contract(setPauseGuardianParameter) = switch (wXTZTokenContract) {
        | Some(wXTZTokenContract) => wXTZTokenContract
        | None => (failwith(errorWXTZTokenContractWrongType): contract(setPauseGuardianParameter))
    };

    let setPauseGuardianOperation: operation = Tezos.transaction(
        setPauseGuardianParameter,
        0mutez,
        wXTZTokenContract
    );

    let operations: list(operation) = [
        setPauseGuardianOperation
    ];

    (operations, storage);
}