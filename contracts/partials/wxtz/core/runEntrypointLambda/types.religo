type lambdaExtras = {
    selfAddress: address
};
type entrypointLambdaParameter = bytes;
type entrypointLambda = (entrypointLambdaParameter, storage, lambdaExtras) => (list(operation), storage);
