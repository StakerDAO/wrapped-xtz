let setPause = ((setPauseParameter, tokenStorage): (bool, tokenStorage)): (entrypointReturn, tokenStorage) => {
    /**
     * Only the pause guardian is allowed to pause token operations, not the administrator.
     * However, only the administrator is allowed to unpause, not the pause-guardian.
     */
    switch (setPauseParameter) {
        | true => {
            switch (Tezos.sender == tokenStorage.pauseGuardian) {
                    | false => (failwith(errorNoPermission): unit)
                    | true => unit
                }
            }
        | false => {
            switch (Tezos.sender == tokenStorage.admin) {
                    | false => (failwith(errorNoPermission): unit)
                    | true => unit
                };
            }
    };
    
    // update pause state in token storage
    let tokenStorage = {
        ...tokenStorage,
        paused: setPauseParameter
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, tokenStorage);
};