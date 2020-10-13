#include "../../mockLambdaContracts/entrypoint.religo"
#include "./ovenInit.religo"

type delegate = key_hash;
type createOvenParameter = {
    delegate: option(delegate),
    ovenOwner: ovenOwner 
};

// Amount to originate the oven with + delegate key_hash
type originateOvenParameter = (tez, option(key_hash), ovenOwner); 

/**
 * Helper function not included in the main lambda file
 * in order to acommodate `#include "oven.religo"` since
 * directives are not supported in standalone expressions (lambdas in our case)
 */
let originateOven = ((xtzAmount, delegate, ovenOwner): originateOvenParameter): (operation, address) => {
    let ovenInitialStorage: ovenStorage = ovenOwner;
    Tezos.create_contract(
// trailing comma is included in the `oven.religo` file itself
// otherwise this snippet would not compile
#include "oven.religo"
        delegate,
        xtzAmount,
        ovenInitialStorage
    );
}