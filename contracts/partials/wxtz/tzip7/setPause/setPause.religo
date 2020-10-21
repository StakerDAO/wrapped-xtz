let setPause = ((parameter, tokenStorage): (bool, tokenStorage)): (entrypointReturn, tokenStorage) => {
    switch (Tezos.sender == tokenStorage.admin) {
        | false => failwith(errorNoPermission): (entrypointReturn, tokenStorage)
        | true => {
            let newStorage = {
                ...tokenStorage,
                paused: parameter
            };
            (emptyListOfOperations, newStorage)
        }
    };
};