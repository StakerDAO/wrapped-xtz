#include "../../lambdas/createOven/oven/storage.religo"
#include "../../lambdas/createOven/oven/parameter.religo"
#include "../../mockLambdaContracts/entrypoint.religo"

// #include "../../lambdas/createOven/oven/oven.tz"

[@inline] let ovenWrapper = [%Michelson ({|
#include "../../lambdas/createOven/oven/oven.tz"
|} : ((ovenParameter, ovenStorage) => (list(operation), ovenStorage)))]
