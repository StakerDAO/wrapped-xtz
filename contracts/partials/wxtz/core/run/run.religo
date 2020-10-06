#include "./types.religo"

let run = ((runParameter, storage): (runParameter, storage)): entrypointReturn => {
    let lambda: option(packedLambda) = Big_map.find_opt(runParameter.lambdaName, storage.lambdas);
    let packedLambda: packedLambda = switch (lambda) {
        | None => (failwith(errorLambdaNotFound): packedLambda)
        | Some(packedLambda) => packedLambda
    };
    // LIGO does not throw an error about option() when unpacking
    let entrypointLambda: option(entrypointLambda) = Bytes.unpack(packedLambda);
    switch (entrypointLambda) {
        | None => (failwith(errorLambdaNotAnEntrypoint): entrypointReturn)
        | Some(entrypointLambda) => entrypointLambda((runParameter.lambdaParameter, storage))
    };
}