#include "./types.religo"
#include "./../errors.religo"

[@inline]
let runArbitraryValueLambda = ((runArbitraryValueLambdaParameter, storage, lambdaExtras): (runArbitraryValueLambdaParameter, storage, lambdaExtras)): arbitraryValueLambdaReturnValue => {
    let lambda: option(packedLambda) = Big_map.find_opt(runArbitraryValueLambdaParameter.lambdaName, storage.lambdas);
    let packedLambda: packedLambda = switch (lambda) {
        | None => (failwith(errorLambdaNotFound): packedLambda)
        | Some(packedLambda) => packedLambda
    };

    let arbitraryValueLambda: option(arbitraryValueLambda) = Bytes.unpack(packedLambda);
    switch (arbitraryValueLambda) {
        | None => (failwith(errorLambdaNotArbitrary): arbitraryValueLambdaReturnValue)
        | Some(arbitraryValueLambda) => arbitraryValueLambda(
            runArbitraryValueLambdaParameter.lambdaParameter,
            storage,
            lambdaExtras
        )
    };
}
