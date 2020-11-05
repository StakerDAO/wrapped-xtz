#include "./oven/parameter.religo"
#include "./oven/storage.religo"
#include "../arbitrary/composeMintOperation/composeMintOperationInit.religo"
#include "../../runArbitraryValueLambda/runArbitraryValueLambda.religo"
#include "../../mockLambdaContracts/entrypoint.religo"


type delegate = key_hash;
type createOvenParameter = {
    delegate: option(delegate),
    ovenOwner: ovenOwner 
};

type originateOvenParameter = (tez, option(key_hash), ovenOwner, address); 

/**
 * Helper function not included in the main lambda file
 * in order to acommodate `#include "./oven/oven.tz"` since
 * directives are not supported in standalone expressions (lambdas in our case)
 */
let originateOven = ((xtzAmount, delegate, ovenOwner, coreContractAddress): originateOvenParameter): (operation, address) => {
    /**
     * Oven requires address of the owner who is able to withdraw XTZ
     * and address of the wXTZ Core that originated it
     */
    let ovenInitialStorage: ovenStorage = {
        coreAddress: coreContractAddress
    };

    Tezos.create_contract(
        // Real `oven.tz` lambda is wrapped in an additional lambda, the included Michelson lambda is executed right away.
        // to satisfy LIGO's type system requirements about `Tezos.create_contract` (First argument must be an inlined function)
        // Even though the included Michelson lambda should satisfy this requirement, it's not the case at the moment.
        ((ovenParameter, ovenStorage): (ovenParameter, ovenStorage)) => [%Michelson ({|
#include "./oven/oven.tz"
        |} : ((ovenParameter, ovenStorage) => (list(operation), ovenStorage)))]((ovenParameter, ovenStorage)),
        // Set the delegate for the newly created contract
        delegate,
        // Choose the amount transferred from wXTZ Core to the newly created contract
        xtzAmount,
        ovenInitialStorage
    );
}