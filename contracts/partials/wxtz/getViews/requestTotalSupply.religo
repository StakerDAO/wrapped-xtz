let requestTotalSupply = ((requestTotalSupplyParameter, storage): (requestTotalSupplyParameter, storage)) => {
    let tzip7Contract: option(contract(getTotalSupplyParameter)) = Tezos.get_entrypoint_opt("%getTotalSupply", requestTotalSupplyParameter);
    let tzip7Contract: contract(getTotalSupplyParameter) = switch (tzip7Contract) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getTotalSupplyParameter))
    };
    let callbackEntrypoint: option(contract(getTotalSupplyResponse)) = Tezos.get_entrypoint_opt("%getTotalSupplyResponse", Tezos.self_address);
    let callbackEntrypoint: contract(getTotalSupplyResponse) = switch (callbackEntrypoint) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getTotalSupplyResponse))
    };

    let request: getTotalSupplyParameter = {
        callback: callbackEntrypoint
    };
    
    let operation = Tezos.transaction(
        request,
        0mutez,
        tzip7Contract
    );

    ([operation]: list(operation), storage)
};