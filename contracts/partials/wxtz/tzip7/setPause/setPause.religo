let setPause = ((setPauseParameter, tokenStorage): (setPauseParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
    /**
     * Only the pause guardian is allowed to pause token operations, not the administrator.
     * However, only the administrator is allowed to unpause, not the pause-guardian.
     */
    switch (setPauseParameter) {
        | true => failIfNotPauseGuardian(tokenStorage)
        | false => failIfNotAdmin(tokenStorage)
    };

    // update pause state in token storage
    let tokenStorage = {
        ...tokenStorage,
        paused: setPauseParameter
    };
    // no operations are returned, only the updated storage
    (emptyListOfOperations, tokenStorage);
};