let setPauseGuardian = ((setPauseGuardianParameter, tokenStorage): (address, tokenStorage)): (entrypointReturn, tokenStorage) => {
    if (Tezos.sender == tokenStorage.admin) {
        let newStorage = {
            ...tokenStorage,
            pauseGuardian: setPauseGuardianParameter
        };
        (emptyListOfOperations, newStorage);
    } else {
        (failwith (errorNoPermission): (entrypointReturn, tokenStorage));
    };
};