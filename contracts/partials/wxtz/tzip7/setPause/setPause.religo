let setPause = ((setPauseParameter, tokenStorage): (bool, tokenStorage)): (entrypointReturn, tokenStorage) => {
    switch (setPauseParameter) {
        | true => {
            switch (Tezos.sender == tokenStorage.pauseGuardian) {
                    | false => (failwith(errorNoPermission): unit)
                    | true => unit
                }
            }
        | false => {
            switch (Tezos.sender == tokenStorage.admin) {
                    | false => (failwith(errorNoPermission): unit)
                    | true => unit
                };
            }
    };

    let newStorage = {
        ...tokenStorage,
        paused: setPauseParameter
    };
    (emptyListOfOperations, newStorage)
};