let setPauseGuardian = ((setPauseGuardianParameter, tokenStorage): (setPauseGuardianParameter, tokenStorage)): tokenEntrypointReturn => {
    // only the current administrator is allowed to change the pause guardian's address
    failIfNotAdmin(tokenStorage);

    let tokenStorage = {
        ...tokenStorage,
        pauseGuardian: setPauseGuardianParameter
    };
    (emptyListOfOperations, tokenStorage);
};
