#include "../../mockLambdaContracts/entrypoint.religo"
// TODO: Including the file directly as `./oven/ovenInit.religo` does not seem to work
#include "../createOven/oven/ovenInit.religo"

type delegate = key_hash;
type createOvenParameter = {
    delegate: option(delegate),
    ovenOwner: ovenOwner 
};

// Amount to originate the oven with + delegate key_hash
type originateOvenParameter = (tez, option(key_hash), ovenOwner, address); 

/**
 * Helper function not included in the main lambda file
 * in order to acommodate `#include "oven.religo"` since
 * directives are not supported in standalone expressions (lambdas in our case)
 */
let originateOven = ((xtzAmount, delegate, ovenOwner, coreContractAddress): originateOvenParameter): (operation, address) => {
    let ovenInitialStorage: ovenStorage = {
        ownerAddress: ovenOwner,
        coreAddress: coreContractAddress // TODO: change for `Tezos.self_address`
    };
    Tezos.create_contract(
// trailing comma is included in the `oven.religo` file itself
// otherwise this snippet would not compile
#include "../createOven/oven/oven.religo"
        delegate,
        xtzAmount,
        ovenInitialStorage
    );
}