let setAdministrator = ((setAdministratorParameter, tokenStorage): (setAdministratorParameter, tokenStorage)): tokenEntrypointReturn => {
    // only the current administrator is allowed to change admin's address
    failIfNotAdmin(tokenStorage);

    let tokenStorage = {
        ...tokenStorage,
        admin: setAdministratorParameter
    };
    // no operations are returned, only the updated token storage
    (emptyListOfOperations, tokenStorage);
};
