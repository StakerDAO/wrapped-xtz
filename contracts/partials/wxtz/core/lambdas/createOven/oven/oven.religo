// There is a trailing comma at the end of this file to
// mitigate `#include` issues in the parent file
((ovenParameter, storage): (ovenParameter, ovenStorage)): (list(operation), ovenStorage) => {
    

    switch (ovenParameter) {
        | Default => {
            let coreContractAddress: address = storage.coreAddress;

            if (Tezos.sender == coreContractAddress) {
                // if the deposit comes from the wXTZ Core, then do nothing
                ([]: list(operation), storage)
            } else { 
                let coreRunEntrypointLambda: option(contract(runEntrypointLambdaParameter)) = Tezos.get_entrypoint_opt("%runEntrypointLambda", coreContractAddress);

                let coreRunEntrypointLambda = switch (coreRunEntrypointLambda) {
                    // TODO: free variable errors in CREATE_CONTRACT prevent us from using a proper error variable here
                    | None => (failwith("9999"): contract(runEntrypointLambdaParameter))
                    | Some(coreRunEntrypointLambda) => coreRunEntrypointLambda
                };

                let coreRunEntrypointLambdaParameter: runEntrypointLambdaParameter = {
                    lambdaName: "onOvenDepositReceived",
                    lambdaParameter: Bytes.pack(())
                };

                let coreContractOnDepositReceivedOperation: operation = Tezos.transaction(
                    coreRunEntrypointLambdaParameter, 
                    Tezos.amount, 
                    coreRunEntrypointLambda
                );

                ([coreContractOnDepositReceivedOperation], storage)
            }
        }
        | Withdraw => (([]: list(operation)), storage)
        | SetDelegate => (([]: list(operation)), storage)
    };
},