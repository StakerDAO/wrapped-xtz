type lambdaName = string;
type packedLambda = bytes;
type lambdas = big_map(lambdaName, packedLambda);

type storage = {
    lambdas: lambdas,
    u: unit,
};

type entrypointReturn = (list(operation), storage);