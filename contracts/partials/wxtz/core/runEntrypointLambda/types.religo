#include "../storage/storage.religo"
#include "../runArbitraryValueLambda/types.religo"
type runEntrypointLambdaParameter = runArbitraryValueLambdaParameter
type entrypointLambdaParameter = bytes;
type entrypointLambda = (entrypointLambdaParameter, storage, lambdaExtras) => (list(operation), storage);
