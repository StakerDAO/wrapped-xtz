((arbitraryValueLambdaParameter, storage, lambdaExtras): (arbitraryValueLambdaParameter, storage, lambdaExtras)): arbitraryValueLambdaReturnValue => {
    let wXTZTokenContractAddress: address = getWXTZTokenContractAddress((storage));
    let wXTZTokenContract: option(contract(burnParameter)) = Tezos.get_entrypoint_opt("%burn", wXTZTokenContractAddress);
    let wXTZTokenContract: contract(burnParameter) = switch (wXTZTokenContract) {
        | Some(wXTZTokenContract) => wXTZTokenContract
        | None => (failwith(errorWXTZTokenContractWrongType): contract(burnParameter))
    };

    let composeBurnOperationParameter: option(composeBurnOperationParameter) = Bytes.unpack(arbitraryValueLambdaParameter);
    let composeBurnOperationParameter: composeBurnOperationParameter = switch (composeBurnOperationParameter) {
        | None => (failwith(errorLambdaParameterWrongType): composeBurnOperationParameter)
        | Some(composeBurnOperationParameter) => composeBurnOperationParameter
    };

    let burnParameter: burnParameter = {
        from_: composeBurnOperationParameter.from_,
        value: composeBurnOperationParameter.value
    };

    let burnOperation: operation = Tezos.transaction(
        burnParameter,
        0mutez,
        wXTZTokenContract
    );

    let operations: list(operation) = [
        burnOperation
    ];

    (operations, storage, Bytes.pack(()));
}
