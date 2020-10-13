type entrypointLambdaParameter = bytes;
type entrypointLambda = (entrypointLambdaParameter, storage) => (list(operation), storage);