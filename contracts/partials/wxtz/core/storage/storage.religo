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

type arbitraryValueKey = string;
type arbitraryValue = bytes;
type arbitraryValues = big_map(arbitraryValueKey, arbitraryValue);

type storage = {
    lambdas: lambdas,
    /**
     * Ovens or any other big_map needs to be part of the storage directly,
     * since big_maps can't be packed into arbitrary values
     * 
     * Solution would be to store ovens in an external contract.
     */
    ovens: ovens,
    arbitraryValues: arbitraryValues
};

type entrypointReturn = (list(operation), storage);