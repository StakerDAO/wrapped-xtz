/**
 * Lambda to handle the Default entrypoint calls, usually used to send XTZ / delegation rewards
 */
((lambdaParameter, storage): (lambdaParameter, storage)): entrypointReturn => {
    // If any XTZ is received, fail with an error
    if (Tezos.amount > 0mutez) {
        (failwith(errorAmountNotZero): entrypointReturn)
    } 
    // Otherwise return the existing contract storage and no operations a.k.a. 'do nothing'
    else {
        ([]: list(operation), storage)
    }
}