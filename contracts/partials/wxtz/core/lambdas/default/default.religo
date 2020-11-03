/**
 * Lambda to handle the Default entrypoint call, used to send XTZ / delegation rewards
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