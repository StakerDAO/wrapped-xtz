let setPauseGuardian = ((setPauseGuardianParameter, tokenStorage): (address, tokenStorage)): (entrypointReturn, tokenStorage) => {
    // only the current administrator is allowed to change the pause guardian's address
    failIfNotAdmin(tokenStorage);

    let newStorage = {
        ...tokenStorage,
        pauseGuardian: setPauseGuardianParameter
    };
    (emptyListOfOperations, newStorage);
};