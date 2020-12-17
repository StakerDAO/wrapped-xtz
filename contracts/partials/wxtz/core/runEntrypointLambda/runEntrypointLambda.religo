#include "./types.religo"
#include "./../runArbitraryValueLambda/runArbitraryValueLambda.religo"

/**
 * runEntrypointLambda must be inlined because it uses the `SELF` instruction
 * // TODO: extract the `selfAddress` definition above the `runEntrypointLambda`
 * so it does not need to be inlined anymore
 */
[@inline]
let runEntrypointLambda = ((runEntrypointLambdaParameter, storage): (runEntrypointLambdaParameter, storage)): entrypointReturn => {
    let entrypointLambdaPrefix = "entrypoint/"; // TODO: move to a separate file with constants
    let lambda: option(packedLambda) = Big_map.find_opt(entrypointLambdaPrefix ++ runEntrypointLambdaParameter.lambdaName, storage.lambdas);
    let packedLambda: packedLambda = switch (lambda) {
        | None => (failwith(errorLambdaNotFound): packedLambda)
        | Some(packedLambda) => packedLambda
    };

    let lambdaExtras: lambdaExtras = {
        selfAddress: Tezos.self_address
    };

    // LIGO does not throw an error about option() when unpacking
    let entrypointLambda: option(entrypointLambda) = Bytes.unpack(packedLambda);
    switch (entrypointLambda) {
        | None => (failwith(errorLambdaNotAnEntrypoint): entrypointReturn)
        | Some(entrypointLambda) => entrypointLambda((
            runEntrypointLambdaParameter.lambdaParameter, 
            storage, 
            lambdaExtras
        ))
    };
}
