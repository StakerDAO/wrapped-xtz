#include "../../../../errors.religo"
#include "../../../../storage/storage.religo"
#include "../../../../runArbitraryValueLambda/types.religo"
#include "../../../../mockLambdaContracts/arbitrary.religo"
#include "../../../../arbitraryValues/getArbitraryValue.religo"

type isOvenOwnerParameter = {
    oven: address,
    owner: address
};
