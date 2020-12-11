#include "./../runEntrypointLambda/types.religo"
type arbitraryValueLambdaParameter = bytes;
type arbitraryValueLambdaReturnValue = (list(operation), storage, bytes);
// TODO: refactor lambda runner type names
type runArbitraryValueLambdaParameter = runEntrypointLambdaParameter;
// TODO: extract the parameter into its own type
type arbitraryValueLambda = ((arbitraryValueLambdaParameter, storage)) => arbitraryValueLambdaReturnValue;
