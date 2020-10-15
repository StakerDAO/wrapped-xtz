/**
 * Helper function used from wXTZ contracts that need to run a lambda/entrypoint
 * on the wXTZ Core
 */
let composeRunEntrypointLambdaOperation = ((runEntrypointLambdaParameter, xtzAmount, coreAddress): (runEntrypointLambdaParameter, tez, address)): operation => {
        // Make sure the address provided is actually wXTZ Core-like
        let coreRunEntrypointLambda: option(contract(runEntrypointLambdaParameter)) = Tezos.get_entrypoint_opt("%runEntrypointLambda", coreAddress);
        let coreRunEntrypointLambda = switch (coreRunEntrypointLambda) {
            | None => (failwith(errorCoreContractEntrypointTypeMissmatch): contract(runEntrypointLambdaParameter))
            | Some(coreRunEntrypointLambda) => coreRunEntrypointLambda
        };

        // Return a transaction to wXTZ Core's `runEntrypointLambda` with the given parameters
        Tezos.transaction(
            runEntrypointLambdaParameter, 
            xtzAmount, 
            coreRunEntrypointLambda
        );
}