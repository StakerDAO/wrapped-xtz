/**
 * Lambda called when a wXTZ Oven receives a deposit of any kind
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    // check if the `Tezos.sender` is a wXTZ Oven originated by the core
    // TODO: extract the oven 'trust check' into an arbitrary value lambda
    let ovenOwner: option(ovenOwner) = Big_map.find_opt(Tezos.sender, storage.ovens);

    /**
     * Calling this entrypoint from contracts not oringated from
     * the wXTZ Core is not allowed
     */
    switch (ovenOwner) {
        | None => failwith(errorOvenNotTrusted)
        | Some(ovenOwner) => ()
    };

    // send the received XTZ back to the sender
    /**
     * TODO: this is a potential workaround for buggy annotations
     * in `Tezos.get_entrypoint_opt`, it might not work due to `contract(unit)`
     * not being the full & correct type signature of the target wXTZ Oven contract,
     * even though the default entrypoint accepts `unit`.
     * 
     * If this workaround does not work, substitute `contract(unit)` with the full
     * type of wXTZ Oven contract.
     * 
     * Real solution is to use `Tezos.get_entrypoint_opt("%default", Tezos.sender)`
     */
    let oven: option(contract(unit)) = Tezos.get_contract_opt(Tezos.sender);
    let oven: contract(unit) = switch (oven) {
        | None => (failwith(errorOvenMissingDefaultEntrypoint): contract(unit))
        | Some(oven) => oven
    };

    let sendBackXTZOperation: operation = Tezos.transaction((), Tezos.amount, oven);

    /**
     * Compose the minting operation on the wXTZ Token contract
     */
    let composeMintOperationParameter: composeMintOperationParameter = ();
    let composeMintOperationParameter: arbitraryValueLambdaParameter = Bytes.pack(composeMintOperationParameter);
    let (mintWXTZOperationList, _, _) = runArbitraryValueLambda((
        {
            lambdaName: "composeMintOperation",
            lambdaParameter: Bytes.pack(()), // TODO: extract a default packed bytes variable
        },
        storage
    ));

    // return all the required operations
    let operations: list(operation) = [
        sendBackXTZOperation,
        ...mintWXTZOperationList
    ];

    (operations, storage);
}

