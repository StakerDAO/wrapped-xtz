((arbitraryValueLambdaParameter, storage): (arbitraryValueLambdaParameter, storage)): arbitraryValueLambdaReturnValue => {    
    let wXTZTokenContractAddress: address = getWXTZTokenContractAddress((storage));
    let wXTZTokenContract: option(contract(mintParameter)) = Tezos.get_entrypoint_opt("%mint", wXTZTokenContractAddress);
    let wXTZTokenContract: contract(mintParameter) = switch (wXTZTokenContract) {
        | Some(wXTZTokenContract) => wXTZTokenContract
        | None => (failwith(errorWXTZTokenContractWrongType): contract(mintParameter))
    };

    let composeMintOperationParameter: option(composeMintOperationParameter) = Bytes.unpack(arbitraryValueLambdaParameter);
    let composeMintOperationParameter: composeMintOperationParameter = switch (composeMintOperationParameter) {
        | None => (failwith(errorLambdaParameterWrongType): composeMintOperationParameter)
        | Some(composeMintOperationParameter) => composeMintOperationParameter
    };

    /**
     * Compose the mint operation
     */
    // TODO: use lambdaParameters to set the amound & address below
    let mintParameter: mintParameter = {
        to_: composeMintOperationParameter.to_,
        value: composeMintOperationParameter.value
    };
    let mintOperation: operation = Tezos.transaction(
        mintParameter,
        0mutez,
        wXTZTokenContract
    );
    
    // Prepare return values
    let operations: list(operation) = [
        mintOperation
    ];

    (operations, storage, Bytes.pack(()));
}