/**
 * Lambda used to allow/deny withdrawal calls from the wXTZ Oven.
 * Also responsible for burning wXTZ equivalent to the amount of XTZ withdrawn.
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    ([]: list(operation), storage)
}