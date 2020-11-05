/**
 * Lambda to add/remove/replace lambdas in the wXTZ Core
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    // check if the Tezos.sender address is the admin
    let (_, _, _) = runArbitraryValueLambda(({
        lambdaName: "arbitrary/permissions/isAdmin",
        lambdaParameter: Bytes.pack(Tezos.sender)
    }, storage));

    // Unpack the provided parameter
    let updateLambdasParameter: option(updateLambdasParameter) = Bytes.unpack(lambdaParameter);
    let updateLambdasParameter = switch (updateLambdasParameter) {
        /**
         * If the provided parameter bytes do not unpack
         * into the desired format, fail with an error.
         */
        | None => (failwith(errorLambdaParameterWrongType): updateLambdasParameter);
        | Some(updateLambdasParameter) => updateLambdasParameter
    };

    /**
     * Update lambda entries in `storage.lambdas` based on the
     * map of packed lambdas in the parameter
     */
    let updateLambdasAccumulator: updateLambdasAccumulator = storage.lambdas;
    let updateLambdasIterator: updateLambdasIterator = 
        ((updateLambdasAccumulator, lambdaUpdate): updateLambdasIteratorParameter): updateLambdasAccumulator => {
            let (lambdaName, optionalPackedLambda) = lambdaUpdate;
            // optionalPackedLambda can be Some/None to upsert/remove the entry
            Map.update(lambdaName, optionalPackedLambda, updateLambdasAccumulator)
        };

    let lambdas: lambdas = Map.fold(updateLambdasIterator, updateLambdasParameter, updateLambdasAccumulator);

    // Update storage with the updated lambda entries
    let storage = {
        ...storage,
        lambdas: lambdas
    };

    // No operations are returned, only the updated storage
    ([]: list(operation), storage);
} // don't put a semicolon here, the compiler does not like it