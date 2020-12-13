let requestAllowance = ((requestAllowanceParameter, storage): (requestAllowanceParameter, storage)) => {
    let tzip7Contract: option(contract(getAllowanceParameterMichelson)) = Tezos.get_entrypoint_opt("%getAllowance", requestAllowanceParameter.at);
    let tzip7Contract: contract(getAllowanceParameterMichelson) = switch (tzip7Contract) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getAllowanceParameterMichelson))
    };
    let callbackEntrypoint: option(contract(getAllowanceResponse)) = Tezos.get_entrypoint_opt("%getAllowanceResponse", Tezos.self_address);
    let callbackEntrypoint: contract(getAllowanceResponse) = switch (callbackEntrypoint) {
        | Some(contract) => contract
        | None => (failwith(errorNoContract): contract(getAllowanceResponse))
    };
    let request: getAllowanceParameter = {
        owner: requestAllowanceParameter.request.owner,
        spender: requestAllowanceParameter.request.spender,
        callback: callbackEntrypoint,
    };

    let requestMichelson: getAllowanceParameterMichelson = Layout.convert_to_left_comb(request);

    let operation = Tezos.transaction(
        requestMichelson,
        0mutez,
        tzip7Contract
    );

    ([operation]: list(operation), storage)
};
