let requestOutcome = ((requestOutcomeParameter, storage): (requestOutcomeParameter, storage)) => {
    let tzip7Contract: option(contract(getOutcomeParameter)) = Tezos.get_entrypoint_opt("%getOutcome", requestOutcomeParameter.at);
    let tzip7Contract: contract(getOutcomeParameter) = switch (tzip7Contract) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getOutcomeParameter))
    };
    let callbackEntrypoint: option(contract(getOutcomeResponse)) = Tezos.get_entrypoint_opt("%getOutcomeResponse", Tezos.self_address);
    let callbackEntrypoint: contract(getOutcomeResponse) = switch (callbackEntrypoint) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getOutcomeResponse))
    };
    let request: getOutcomeParameter = {
        secretHash: requestOutcomeParameter.request,
        callback: callbackEntrypoint,
    };
    let operation = Tezos.transaction(
        request,
        0mutez,
        tzip7Contract
    );

    ([operation]: list(operation), storage)
};
