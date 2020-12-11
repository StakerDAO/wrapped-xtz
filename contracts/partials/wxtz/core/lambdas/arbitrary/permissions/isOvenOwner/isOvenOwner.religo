/**
 * Check if the provided address owns the provided oven address
 */
((arbitraryValueLambdaParameter, storage): (arbitraryValueLambdaParameter, storage)): arbitraryValueLambdaReturnValue => {
    // unpack the lambda parameter
    let isOvenOwnerParameter: option(isOvenOwnerParameter) = Bytes.unpack(arbitraryValueLambdaParameter);
    let isOvenOwnerParameter: isOvenOwnerParameter = switch (isOvenOwnerParameter) {
        | None => failwith(errorLambdaParameterWrongType): isOvenOwnerParameter
        | Some(isOvenOwnerParameter) => isOvenOwnerParameter
    };

    // find the real oven owner
    let realOvenOwner: option(address) = Big_map.find_opt(
        isOvenOwnerParameter.oven,
        storage.ovens
    );
    let realOvenOwner: address = switch (realOvenOwner) {
        | None => failwith(errorOvenNotFound): address
        | Some(realOvenOwner) => realOvenOwner
    };

    // compare the real oven owner with the provided owner address
    let isOvenOwner = realOvenOwner == isOvenOwnerParameter.owner;
    switch (isOvenOwner) {
        | false => failwith(errorNotAnOvenOwner): arbitraryValueLambdaReturnValue
        | true => ([]: list(operation), storage, Bytes.pack(()))
    };
}
