/**
 * Lambda called when a wXTZ Oven receives a deposit of any kind
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    // check if the address calling this entrypoint is a trusted oven
    let (_, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/permissions/isTrustedOven",
        lambdaParameter: Bytes.pack(Tezos.sender)
    }, storage));

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
     * Real solution would be to use `Tezos.get_entrypoint_opt("%default", Tezos.sender)`
     */
    let oven: option(contract(unit)) = Tezos.get_contract_opt(Tezos.sender);
    let oven: contract(unit) = switch (oven) {
        | None => (failwith(errorOvenMissingDefaultEntrypoint): contract(unit))
        | Some(oven) => oven
    };

    let ovenOwner: option(address) = Big_map.find_opt(Tezos.sender, storage.ovens);
    let ovenOwner: address = switch (ovenOwner) {
        | None => (failwith(errorOvenNotFound): address)
        | Some(ovenOwner) => ovenOwner
    };

    let sendBackXTZOperation: operation = Tezos.transaction((), Tezos.amount, oven);

    /**
     * Compose the minting operation on the wXTZ Token contract
     */
    let composeMintOperationParameter: composeMintOperationParameter = {
        to_: ovenOwner,
        value: Tezos.amount / 1tez // TODO: extract as tezToNat(tez)
    };
    let composeMintOperationParameter: arbitraryValueLambdaParameter = Bytes.pack(composeMintOperationParameter);
    let (mintWXTZOperationList, _, _) = runArbitraryValueLambda((
        {
            lambdaName: "arbitrary/composeMintOperation",
            lambdaParameter: composeMintOperationParameter, 
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

