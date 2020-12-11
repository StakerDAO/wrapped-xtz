#include "./types.religo"
#include "./../errors.religo"
let runArbitraryValueLambda = ((runArbitraryValueLambdaParameter, storage): (runArbitraryValueLambdaParameter, storage)): arbitraryValueLambdaReturnValue => {
    let lambda: option(packedLambda) = Big_map.find_opt(runArbitraryValueLambdaParameter.lambdaName, storage.lambdas);
    let packedLambda: packedLambda = switch (lambda) {
        | None => (failwith(errorLambdaNotFound): packedLambda)
        | Some(packedLambda) => packedLambda
    };

    // TODO: extract lambdaExtras for 
    let lambdaExtras: lambdaExtras = {
        selfAddress: Tezos.self_address
    };

    let arbitraryValueLambda: option(arbitraryValueLambda) = Bytes.unpack(packedLambda);
    switch (arbitraryValueLambda) {
        | None => (failwith(errorLambdaNotArbitrary): arbitraryValueLambdaReturnValue)
        | Some(arbitraryValueLambda) => arbitraryValueLambda(
            runArbitraryValueLambdaParameter.lambdaParameter,
            storage
        )
    };
}
