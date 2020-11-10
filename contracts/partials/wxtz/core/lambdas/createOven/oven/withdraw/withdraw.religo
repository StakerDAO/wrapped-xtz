#include "./parameter.religo"
#include "../../../../errors.religo"
#include "../../../onOvenWithdrawalRequested/onOvenWithdrawalRequestedInit.religo"


type vaultOwnerContract = contract(unit);
let withdraw = ((withdrawParameter, storage): (withdrawParameter, ovenStorage)): (list(operation), ovenStorage) => {
    let coreContractAddress: address = storage.coreAddress;
    let onOvenWithdrawalRequestedParameter: onOvenWithdrawalRequestedParameter = withdrawParameter;

    let coreRunEntrypointLambdaParameter: runEntrypointLambdaParameter = {
        lambdaName: "onOvenWithdrawalRequested",
        lambdaParameter: Bytes.pack(onOvenWithdrawalRequestedParameter)
    };

    let coreContractOnOvenWithdrawalRequestedOperation = composeRunEntrypointLambdaOperation((
        coreRunEntrypointLambdaParameter,
        Tezos.amount, // TODO: should the Tezos.amount > 1 be rejected right away or should the hook logic do it?
        coreContractAddress
    ));

    // we can be certain that the Tezos.sender will be the vault owner
    // thanks to the hook validations implemented in the core
    let vaultOwnerContract: option(contract(unit)) = Tezos.get_contract_opt(Tezos.sender);
    let vaultOwnerContract: vaultOwnerContract = switch (vaultOwnerContract) {
        | Some(vaultOwnerContract) => vaultOwnerContract
        | None => failwith(errorOvenOwnerDoesNotAcceptDeposits): vaultOwnerContract
    };

    let amountOfXTZToWithdraw = withdrawParameter * 1tez; // cast nat to tez
    let withdrawXTZOperation = Tezos.transaction(
        (),
        amountOfXTZToWithdraw,
        vaultOwnerContract
    );

    ([
        coreContractOnOvenWithdrawalRequestedOperation,
        withdrawXTZOperation
    ], storage);
}