/**
 * Checks if the provided address matches the admin address from the storage
 */
((arbitraryValueLambdaParameter, storage): (arbitraryValueLambdaParameter, storage)): arbitraryValueLambdaReturnValue => {
    // unpack admin address from the storage
    // TODO: extract into a getAdminAddress function
    let admin: bytes = getArbitraryValue(("admin", storage));
    let admin: option(address) = Bytes.unpack(admin);
    let admin: address = switch (admin) {
        | None => failwith(errorAdminAddressWrongType): address
        | Some(admin) => admin
    };

    // unpack the address provided as a parameter
    let addressToCompare: option(address) = Bytes.unpack(arbitraryValueLambdaParameter);
    let addressToCompare: address = switch (addressToCompare) {
        | None => failwith(errorLambdaParameterWrongType): address
        | Some(addressToCompare) => addressToCompare
    };

    /**
     * Compare and fail if the addresses don't match
     */
    let isAdmin = admin == addressToCompare;
    switch (isAdmin) {
        // TODO: rename error, it's now always the `sender` being checked here
        | false => failwith(errorSenderIsNotAdmin): arbitraryValueLambdaReturnValue
        | true => ([]: list(operation), storage, Bytes.pack(()))
    };
}
