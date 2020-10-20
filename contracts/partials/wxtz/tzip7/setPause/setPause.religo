let setPause = ((parameter, tokenStorage): (bool, tokenStorage)): (list(operation), tokenStorage) => {
    switch (Tezos.sender == tokenStorage.admin) {
        | false => failwith(errorNoPermission): (list(operation), tokenStorage)
        | true => {
            let newStorage = {
                ...tokenStorage,
                paused: parameter
            };
            (([]: list(operation)), newStorage)
        }
    };
};