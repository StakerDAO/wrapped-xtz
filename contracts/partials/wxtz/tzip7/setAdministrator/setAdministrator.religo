let setAdministrator = ((setAdministratorParameter, tokenStorage): (address, tokenStorage)): tokenEntrypointReturn => {
    // only the current administrator is allowed to change admin's address
    if (Tezos.sender == tokenStorage.admin) {
        let tokenStorage = {
            ...tokenStorage,
            admin: setAdministratorParameter
        };
        // no operations are returned, only the updated token storage
        (emptyListOfOperations, tokenStorage);
    } else {
        (failwith (errorSenderIsNotAdmin): tokenEntrypointReturn);
    };
};