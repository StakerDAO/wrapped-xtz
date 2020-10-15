let setAdministrator = ((setAdministratorParameter,s): (address, storage)): (list(operation), storage) => {
    if (Tezos.sender == s.token.admin) {
        let newStorage = {
            ...s,
            token: {
                ...s.token,
                admin: setAdministratorParameter
            }
        };
        ([]: (list(operation)), newStorage)
    } else {
        (failwith ("NoPermission"): (list(operation), storage))
    };
};