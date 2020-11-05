let requestBalance = ((requestBalanceParameter, storage): (requestBalanceParameter, storage)) => {
    let tzip7Contract: option(contract(getBalanceParameter)) = Tezos.get_entrypoint_opt("%getBalance", requestBalanceParameter.at);
    let tzip7Contract: contract(getBalanceParameter) = switch (tzip7Contract) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getBalanceParameter))
    };
    let callbackEntrypoint: option(contract(getBalanceResponse)) = Tezos.get_entrypoint_opt("%getBalanceResponse", Tezos.self_address);
    let callbackEntrypoint: contract(getBalanceResponse) = switch (callbackEntrypoint) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getBalanceResponse))
    };
    let request: getBalanceParameter = {
        owner: requestBalanceParameter.request,
        callback: callbackEntrypoint,
    };
    let operation = Tezos.transaction(
        request,
        0mutez,
        tzip7Contract
    );

    ([operation]: list(operation), storage)
};