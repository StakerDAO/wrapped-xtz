/**
 * Lambda to handle the default entrypoint call on core known as %default.
 * It rejects any incoming XTZ.
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    // If any XTZ is received, fail with an error
    // TODO: extract this if statement into a helper function
    if (Tezos.amount > 0mutez) {
        (failwith(errorAmountNotZero): entrypointReturn)
    } 
    // Otherwise return the existing contract storage and no operations a.k.a. 'do nothing'
    else {
        ([]: list(operation), storage)
    }
}
