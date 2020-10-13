type lambdaName = string;
type packedLambda = bytes;
type lambdas = big_map(lambdaName, packedLambda);

type oven = address;
type ovenOwner = address;
type ovenSet = set(oven);
/**
 * Storing the relationship between owner and an existing oven address
 * enables easier client data representation and makes potential
 * oven migration simplier in the future.
 */
type ovens = big_map(oven, ovenOwner);

type storage = {
    lambdas: lambdas,
    ovens: ovens,
    u: unit,
};

type entrypointReturn = (list(operation), storage);