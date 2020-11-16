/*
 * This manager is an originated account
 * that owns an oven for testing purposes.
 */

type setDelegateParameter = {
    ovenAddress: address,
    delegate: option(key_hash),
};

type withdrawParameter = {
    ovenAddress: address,
    amount: nat
};

type parameter = 
| Default(unit)
| SetDelegate(setDelegateParameter)
| Withdraw(withdrawParameter);

type storage = unit;

let main = ((parameter, storage): (parameter, storage)) => {
    switch(parameter) {
        | Default => {
            ([]: list(operation), storage)
        }
        | SetDelegate(setDelegateParameter) => {
            let ovenContract: option(contract(option(key_hash))) = Tezos.get_entrypoint_opt("%setDelegate", setDelegateParameter.ovenAddress);
            let ovenContract: contract(option(key_hash)) = switch (ovenContract) {
                | Some(contract) => contract
                | None => (failwith("noSetDelegateEntrypointFound"): contract(option(key_hash)))
            };
        
            let operation = Tezos.transaction(
                setDelegateParameter.delegate,
                0mutez,
                ovenContract
            );

            ([operation]: list(operation), storage)
        }
        | Withdraw(withdrawParameter) => { 
            let ovenContract: option(contract(nat)) = Tezos.get_entrypoint_opt("%withdraw", withdrawParameter.ovenAddress);
            let ovenContract: contract(nat) = switch (ovenContract) {
                | Some(contract) => contract
                | None => (failwith("noWithdrawEntrypointFound"): contract(nat))
            };
        
            let operation = Tezos.transaction(
                withdrawParameter.amount,
                0mutez,
                ovenContract
            );

            ([operation]: list(operation), storage)
        }
    };
};