#include "../storage/storage.religo"
type arbitraryValueLambdaParameter = bytes;
type arbitraryValueLambdaReturnValue = (list(operation), storage, bytes);
type lambdaName = string;
type lambdaParameter = bytes;

type lambdaExtras = {
    selfAddress: address
};
            
type runArbitraryValueLambdaParameter = {
    lambdaName: lambdaName,
    lambdaParameter: lambdaParameter
};

type arbitraryValueLambda = ((arbitraryValueLambdaParameter, storage, lambdaExtras)) => arbitraryValueLambdaReturnValue;
