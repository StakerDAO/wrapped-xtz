#include "./types.religo"

/**
 * runEntrypointLambda must be inlined because it uses the `SELF` instruction
 * // TODO: extract the `selfAddress` definition above the `runEntrypointLambda`
 * so it does not need to be inlined anymore
 */
[@inline]
let runEntrypointLambda = ((runEntrypointLambdaParameter, storage): (runEntrypointLambdaParameter, storage)): entrypointReturn => {
    let lambda: option(packedLambda) = Big_map.find_opt(runEntrypointLambdaParameter.lambdaName, storage.lambdas);
    let packedLambda: packedLambda = switch (lambda) {
        | None => (failwith(errorLambdaNotFound): packedLambda)
        | Some(packedLambda) => packedLambda
    };
    
    /**
     * Used to pass data that is by design not accessible to lambdas
     */
    let lambdaExtras: lambdaExtras = {
        selfAddress: Tezos.self_address
    };

    // LIGO does not throw an error about option() when unpacking
    let entrypointLambda: option(entrypointLambda) = Bytes.unpack(packedLambda);
    switch (entrypointLambda) {
        | None => (failwith(errorLambdaNotAnEntrypoint): entrypointReturn)
        | Some(entrypointLambda) => entrypointLambda((runEntrypointLambdaParameter.lambdaParameter, storage, lambdaExtras))
    };
}