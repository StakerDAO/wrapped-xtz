/**
 * Checks if the provided address is a trusted oven
 */
((arbitraryValueLambdaParameter, storage): (arbitraryValueLambdaParameter, storage)): arbitraryValueLambdaReturnValue => {
    // unpack the lambda parameters
    let ovenAddress: option(address) = Bytes.unpack(arbitraryValueLambdaParameter);
    let ovenAddress: address = switch (ovenAddress) {
        | None => failwith(errorLambdaParameterWrongType): address
        | Some(ovenAddress) => ovenAddress 
    };

    /**
     * Find an owner for the provided oven address,
     * if there is an owner, the oven address is considered trusted.
     */
    let ovenOwner: option(address) = Big_map.find_opt(ovenAddress, storage.ovens);
    switch (ovenOwner) {
        | None => failwith(errorOvenNotTrusted): arbitraryValueLambdaReturnValue
        | Some(ovenOwner) => ([]: list(operation), storage, Bytes.pack(()))
    };
}