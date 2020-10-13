/**
 * Lambda called when a wXTZ Oven receives a deposit of any kind
 */
((lambdaParameter, storage): (lambdaParameter, storage)): entrypointReturn => {
    // check if the `Tezos.sender` is a wXTZ Oven originated by the core
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
    // TODO: implement a real minting call once a token contract is in place
    // let mintWXTZOperation: operation = Tezos.transaction((), 0mutez, oven);
    
    let operations: list(operation) = [
        sendBackXTZOperation
        // mintWXTZOperation
    ];

    (operations, storage);
    // ([]: list(operation), storage);
}

