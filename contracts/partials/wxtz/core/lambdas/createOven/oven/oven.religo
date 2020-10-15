/**
 * Main lambda of the wXTZ Oven contract that provides entrypoint routing
 */
((ovenParameter, storage): (ovenParameter, ovenStorage)): (list(operation), ovenStorage) => {
    switch (ovenParameter) {
        | Default => default((), storage)
        | Withdraw => (([]: list(operation)), storage) // TODO: implement Withdraw
        | SetDelegate => (([]: list(operation)), storage) // TODO: implement SetDelegate
    };
}