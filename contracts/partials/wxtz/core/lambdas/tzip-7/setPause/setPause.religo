((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    let (_, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/permissions/isAdmin",
        lambdaParameter: Bytes.pack(Tezos.sender)
    }, storage));

    let setPauseParameter: option(setPauseParameter) = Bytes.unpack(lambdaParameter);
    let setPauseParameter: setPauseParameter = switch (setPauseParameter) {
        | None => (failwith(errorLambdaParameterWrongType): setPauseParameter)
        | Some(setPauseParameter) => setPauseParameter
    };

    let wXTZTokenContractAddress: address = getWXTZTokenContractAddress(storage);

    /**
     * This piece of code could be abstracted if `get_contract_opt` 
     * was used and a full contract parameter passed instead.
     */
    let wXTZTokenContract: option(contract(setPauseParameter)) = Tezos.get_entrypoint_opt("%setPause", wXTZTokenContractAddress);
    let wXTZTokenContract: contract(setPauseParameter) = switch (wXTZTokenContract) {
        | Some(wXTZTokenContract) => wXTZTokenContract
        | None => (failwith(errorWXTZTokenContractWrongType): contract(setPauseParameter))
    };

    let setPauseOperation: operation = Tezos.transaction(
        setPauseParameter,
        0mutez,
        wXTZTokenContract
    );

    let operations: list(operation) = [
        setPauseOperation
    ];

    (operations, storage);
}