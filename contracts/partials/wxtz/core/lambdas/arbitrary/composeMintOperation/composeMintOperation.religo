((arbitraryValueLambdaParameter, storage): (arbitraryValueLambdaParameter, storage)): arbitraryValueLambdaReturnValue => {
    // obtain the wXTZ token contract address
    let wXTZTokenContractAddress: bytes = getArbitraryValue(("wXTZTokenContractAddress", storage));
    let wXTZTokenContractAddress: option(address) = Bytes.unpack(wXTZTokenContractAddress);
    
    let wXTZTokenContract: contract(mintParameter) = switch (wXTZTokenContractAddress) {
        // unwrap the wXTZ token contract address into a typed contract accepting a mint call
        | Some(wXTZTokenContractAddress) => {
            // TODO: extract the %mint entrypoint name into a variable
            let wXTZTokenContract: option(contract(mintParameter)) = Tezos.get_entrypoint_opt("%mint", wXTZTokenContractAddress);
            switch (wXTZTokenContract) {
                | Some(wXTZTokenContract) => wXTZTokenContract
                | None => (failwith(errorWXTZTokenContractWrongType): contract(mintParameter))
            };
        }
        | None => (failwith(errorArbitraryValueWrongType): contract(mintParameter))
    };
    
    /**
     * Compose the mint operation
     */
    // TODO: use lambdaParameters to set the amound & address below
    let mintParameter: mintParameter = {
        address_to: Tezos.sender,
        value: Tezos.amount / 1tez // TODO: extract as tezToNat(tez)
    };
    let mintOperation: operation = Tezos.transaction(
        mintParameter,
        0mutez,
        wXTZTokenContract
    );
    
    // Prepare return values
    let operations: list(operation) = [mintOperation];
    let r = Bytes.pack(()); // TODO: extract a packed unit into a variable for default returns

    (operations, storage, r);
}