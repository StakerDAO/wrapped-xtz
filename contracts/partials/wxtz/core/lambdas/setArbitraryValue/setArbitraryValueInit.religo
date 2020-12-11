#include "../../mockLambdaContracts/entrypoint.religo"
#include "../../runArbitraryValueLambda/runArbitraryValueLambda.religo"
#include "../../arbitraryValues/setArbitraryValue.religo"

type setArbitraryValueParameter = {
    arbitraryValueKey: arbitraryValueKey,
    arbitraryValue: option(arbitraryValue) 
};