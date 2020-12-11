#include "../storage/getTokenBalance.religo"

let getBalance = ((getBalanceParameter, tokenStorage): (getBalanceParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
    let tokenBalance = getTokenBalance(getBalanceParameter.owner, tokenStorage.ledger);
    let operation = Tezos.transaction(
        tokenBalance,
        0mutez,
        getBalanceParameter.callback
    );
    ([operation], tokenStorage);
};