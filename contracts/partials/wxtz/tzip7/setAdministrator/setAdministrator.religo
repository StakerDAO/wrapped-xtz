let setAdministrator = ((setAdministratorParameter, tokenStorage): (address, tokenStorage)): (list(operation), tokenStorage) => {
    if (Tezos.sender == tokenStorage.admin) {
        let newStorage = {
            ...tokenStorage,
            admin: setAdministratorParameter
        };
        ([]: (list(operation)), newStorage)
    } else {
        (failwith (errorNoPermission): (list(operation), tokenStorage));
    };
};