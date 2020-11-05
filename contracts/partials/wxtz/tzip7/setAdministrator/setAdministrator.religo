let setAdministrator = ((setAdministratorParameter, tokenStorage): (address, tokenStorage)): (entrypointReturn, tokenStorage) => {
    // only the current administrator is allowed to change admin's address
    if (Tezos.sender == tokenStorage.admin) {
        let newStorage = {
            ...tokenStorage,
            admin: setAdministratorParameter
        };
        // no operations are returned, only the updated token storage
        (emptyListOfOperations, newStorage);
    } else {
        (failwith (errorNoPermission): (entrypointReturn, tokenStorage));
    };
};