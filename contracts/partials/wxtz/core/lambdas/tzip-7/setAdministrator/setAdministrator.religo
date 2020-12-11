((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    let (_, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/permissions/isAdmin",
        lambdaParameter: Bytes.pack(Tezos.sender)
    }, storage));

    let setAdministratorParameter: option(setAdministratorParameter) = Bytes.unpack(lambdaParameter);
    let setAdministratorParameter: setAdministratorParameter = switch (setAdministratorParameter) {
        | None => (failwith(errorLambdaParameterWrongType): setAdministratorParameter)
        | Some(setAdministratorParameter) => setAdministratorParameter
    };

    let wXTZTokenContractAddress: address = getWXTZTokenContractAddress(storage);

    /**
     * This piece of code could be abstracted if `get_contract_opt` 
     * was used and a full contract parameter passed instead.
     */
    let wXTZTokenContract: option(contract(setAdministratorParameter)) = Tezos.get_entrypoint_opt("%setAdministrator", wXTZTokenContractAddress);
    let wXTZTokenContract: contract(setAdministratorParameter) = switch (wXTZTokenContract) {
        | Some(wXTZTokenContract) => wXTZTokenContract
        | None => (failwith(errorWXTZTokenContractWrongType): contract(setAdministratorParameter))
    };

    let setAdministratorOperation: operation = Tezos.transaction(
        setAdministratorParameter,
        0mutez,
        wXTZTokenContract
    );

    let operations: list(operation) = [
        setAdministratorOperation
    ];

    (operations, storage);
}