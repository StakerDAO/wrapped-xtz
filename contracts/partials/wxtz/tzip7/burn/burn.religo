let burn = ((burnParameter, s): (burnParameter, storage)): (list(operation), storage) => {
    if ( Tezos.sender == s.token.admin) {
        let tokenBalance = switch (Big_map.find_opt(burnParameter.from_, s.token.ledger)) {
            | Some(value) => value
            | None => 0n
	    };
        if (tokenBalance < burnParameter.value) { (failwith ("NotEnoughBalance"): (list(operation), storage)); }
        else {
            let newTokenBalance = abs(tokenBalance - burnParameter.value);
            let newTokens = Big_map.update(
                burnParameter.from_,
                Some(newTokenBalance),
                s.token.ledger
            );
            let newStorage = {
                ...s,
                token: {
                    ...s.token,
                    ledger: newTokens
                }
            };
            (([]: list (operation)), newStorage);
        };
    } else {
        (failwith ("NoPermission"): (list(operation), storage))
    };
};