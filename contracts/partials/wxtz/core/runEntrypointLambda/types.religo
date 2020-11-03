#include "../storage/storage.religo"
type lambdaName = string;
type lambdaParameter = bytes;
type runEntrypointLambdaParameter = {
    lambdaName: lambdaName,
    lambdaParameter: lambdaParameter
};

type lambdaExtras = {
    selfAddress: address
};
type entrypointLambdaParameter = bytes;
type entrypointLambda = (entrypointLambdaParameter, storage, lambdaExtras) => (list(operation), storage);
