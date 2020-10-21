let setAdministrator = ((setAdministratorParameter, tokenStorage): (address, tokenStorage)): (entrypointReturn, tokenStorage) => {
    if (Tezos.sender == tokenStorage.admin) {
        let newStorage = {
            ...tokenStorage,
            admin: setAdministratorParameter
        };
        (emptyListOfOperations, newStorage)
    } else {
        (failwith (errorNoPermission): (entrypointReturn, tokenStorage));
    };
};