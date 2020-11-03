#include "../oven/parameter.religo"
#include "../oven/storage.religo"

#include "../../../runEntrypointLambda/parameter.religo"

#include "../oven/default/default.religo"
#include "../oven/setDelegate/setDelegate.religo"
#include "../oven/withdraw/withdraw.religo"

type storage = ovenStorage;
type parameter = (ovenParameter, ovenStorage) => (list(operation), ovenStorage);
type entrypointReturn = (list(operation), storage);

#include "../../../mockLambdaContracts/emptyEntrypoint.religo"