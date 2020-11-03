/**
 * Main lambda of the wXTZ Oven contract that provides entrypoint routing
 */
((ovenParameter, storage): (ovenParameter, ovenStorage)): (list(operation), ovenStorage) => {
    switch (ovenParameter) {
        | Default => default((), storage)
        | Withdraw(withdrawParameter) => withdraw((withdrawParameter, storage))
        | SetDelegate(setDelegateParameter) => setDelegate((setDelegateParameter, storage))
    };
}