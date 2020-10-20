let burn = ((burnParameter, tokenStorage): (burnParameter, tokenStorage)): (list(operation), tokenStorage) => {
    let hasPermission = switch(Tezos.sender == tokenStorage.admin) {
        | true => true
        | false => (failwith(errorNoPermission): bool)
    };

    let optionalTokenBalance = Big_map.find_opt(burnParameter.from_, tokenStorage.ledger);
    let tokenBalance = switch (optionalTokenBalance) {
        | Some(tokenBalance) => tokenBalance
        | None => 0n
    };

    if (tokenBalance < burnParameter.value) { 
        (failwith(errorNotEnoughBalance): (list(operation), tokenStorage))
    }
    else {
        let newTokenBalance = abs(tokenBalance - burnParameter.value);
        let newTokens = Big_map.update(
            burnParameter.from_,
            Some(newTokenBalance),
            tokenStorage.ledger
        );
        let newTotalSupply = abs(tokenStorage.totalSupply - burnParameter.value);
        let newStorage = {
            ...tokenStorage,
            ledger: newTokens,
            totalSupply: newTotalSupply,
        };
        (([]: list(operation)), newStorage);
    };
};