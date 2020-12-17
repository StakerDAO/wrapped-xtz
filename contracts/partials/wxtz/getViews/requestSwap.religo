let requestSwap = ((requestSwapParameter, storage): (requestSwapParameter, storage)) => {
    let tzip7Contract: option(contract(getSwapParameter)) = Tezos.get_entrypoint_opt("%getSwap", requestSwapParameter.at);
    let tzip7Contract: contract(getSwapParameter) = switch (tzip7Contract) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getSwapParameter))
    };
    let callbackEntrypoint: option(contract(getSwapResponse)) = Tezos.get_entrypoint_opt("%getSwapResponse", Tezos.self_address);
    let callbackEntrypoint: contract(getSwapResponse) = switch (callbackEntrypoint) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getSwapResponse))
    };
    let request: getSwapParameter = {
        secretHash: requestSwapParameter.request.secretHash,
        swapInitiator: requestSwapParameter.request.swapInitiator,
        callback: callbackEntrypoint,
    };
    let operation = Tezos.transaction(
        request,
        0mutez,
        tzip7Contract
    );

    ([operation]: list(operation), storage)
};
