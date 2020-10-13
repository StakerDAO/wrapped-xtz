#include "../../mockLambdaContracts/entrypoint.religo"
type updateLambdasParameter = map(lambdaName, option(packedLambda));
type lambdaUpdate = (lambdaName, option(packedLambda));
type updateLambdasAccumulator = lambdas;
type updateLambdasIteratorParameter = (updateLambdasAccumulator, lambdaUpdate);
type updateLambdasIterator = (updateLambdasIteratorParameter) => updateLambdasAccumulator;