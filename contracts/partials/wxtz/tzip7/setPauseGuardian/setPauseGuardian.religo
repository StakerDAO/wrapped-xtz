let setPauseGuardian = ((setPauseGuardianParameter, tokenStorage): (address, tokenStorage)): tokenEntrypointReturn => {
    if (Tezos.sender == tokenStorage.admin) {
        let newStorage = {
            ...tokenStorage,
            pauseGuardian: setPauseGuardianParameter
        };
        (emptyListOfOperations, newStorage);
    } else {
        (failwith (errorSenderIsNotAdmin): tokenEntrypointReturn);
    };
};