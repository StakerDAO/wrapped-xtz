/*
 * This manager is an originated account
 * that owns an oven for testing purposes.
 */

#include "../../partials/wxtz/core/lambdas/onOvenDepositReceived/onOvenDepositReceivedInit.religo"
#include "../../partials/wxtz/core/runEntrypointLambda/composeRunEntrypointLambdaOperation.religo"


type setDelegateParameter = {
    ovenAddress: address,
    delegate: option(key_hash),
};

type withdrawParameter = {
    ovenAddress: address,
    amount: nat
};

type depositParameter = {
    coreAddress: address
};

type parameter = 
| Default(unit)
| SetDelegate(setDelegateParameter)
| Withdraw(withdrawParameter)
| Deposit(depositParameter);

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
        | Deposit(depositParameter) => {
            let coreContract: option(contract(runEntrypointLambdaParameter)) = Tezos.get_entrypoint_opt("%runEntrypointLambda", depositParameter.coreAddress);
            let coreContract: contract(runEntrypointLambdaParameter) = switch (coreContract) {
                | Some(contract) => contract
                | None => (failwith("noOnOvenDepositReceivedEntrypointFound"): contract(runEntrypointLambdaParameter))
            };

            let coreRunEntrypointLambdaParameter: runEntrypointLambdaParameter = {
                lambdaName: "onOvenDepositReceived", // TODO: extract the lambda name into a variable
                lambdaParameter: Bytes.pack(())
            };
        
            let operation = Tezos.transaction(
                coreRunEntrypointLambdaParameter,
                Tezos.amount,
                coreContract
            );

            ([operation]: list(operation), storage)
        }
    };
};