/*
 * This manager is an originated account
 * that owns an oven for testing purposes.
 * It has no default entrypoint and therefore
 * considered as broken/unfit to own an oven.
 */

type withdrawParameter = {
    ovenAddress: address,
    amount: nat
};

type parameter = 
| Placeholder(unit)
| Withdraw(withdrawParameter);

type storage = unit;

let main = ((parameter, storage): (parameter, storage)) => {
    switch(parameter) {
        | Placeholder => {
            ([]: list(operation), storage);
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

            ([operation]: list(operation), storage);
        }
    };
};