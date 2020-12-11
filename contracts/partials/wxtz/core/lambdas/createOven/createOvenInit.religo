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
 * in order to acommodate include "./oven/oven.tz" since
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

/**
 * Some known addresses can't be ovenOwners by design,
 * this validation exists to prevent obscure edge cases.
 * 
 * // TODO: should the admin address also be included in this validation?
 */
let failIfInvalidOvenOwner = (ovenOwner: ovenOwner, storage: storage, lambdaExtras: lambdaExtras): unit => {
    let existingOvenOwner: option(address) = Big_map.find_opt(ovenOwner, storage.ovens);
    let isOvenOwnerTrustedOven: bool = switch (existingOvenOwner) {
        | Some(existingOvenOwner) => true // oven with address `ovenOwner` has been found
        | None => false
    };
    
    let wXTZTokenContractAddress: address = getWXTZTokenContractAddress((storage));
    let isOvenOwnerWXTZTokenContract: bool = ovenOwner == wXTZTokenContractAddress;

    let isOvenOwnerCurrentContract: bool = ovenOwner == lambdaExtras.selfAddress;
    
    let isInvalidOvenOwner: bool = 
        isOvenOwnerCurrentContract 
        || isOvenOwnerTrustedOven
        || isOvenOwnerWXTZTokenContract;
    
    switch (isInvalidOvenOwner) {
        | true => failwith(errorInvalidOvenOwner)
        | false => ()
    };
};