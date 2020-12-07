let defaultBalance: nat = 0n;
// do not change defaultAllowanceValue constant
let defaultAllowanceValue: nat = 0n;
let emptyListOfOperations: list(operation) = [];
type entrypointReturn = (list(operation), storage);
type bridgeEntrypointReturn = (list(operation), bridgeStorage);
type tokenEntrypointReturn = (list(operation), tokenStorage);