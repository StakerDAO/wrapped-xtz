#include "./parameter.religo"
#include "../../../../errors.religo"
#include "../../../onOvenWithdrawalRequested/onOvenWithdrawalRequestedInit.religo"

type ovenOwnerContract = contract(unit);

let withdraw = ((withdrawParameter, storage): (withdrawParameter, ovenStorage)): (list(operation), ovenStorage) => {
    let coreContractAddress: address = storage.coreAddress;
    let onOvenWithdrawalRequestedParameter: onOvenWithdrawalRequestedParameter = {
        sender: Tezos.sender,
        value: withdrawParameter,
    };

    let coreRunEntrypointLambdaParameter: runEntrypointLambdaParameter = {
        lambdaName: "onOvenWithdrawalRequested",
        lambdaParameter: Bytes.pack(onOvenWithdrawalRequestedParameter)
    };

    let coreContractOnOvenWithdrawalRequestedOperation = composeRunEntrypointLambdaOperation((
        coreRunEntrypointLambdaParameter,
        Tezos.amount, // TODO: should the Tezos.amount > 1 be rejected right away or should the hook logic do it?
        coreContractAddress
    ));

    // we can be certain that the Tezos.sender will be the oven owner
    // thanks to the hook validations implemented in the core
    let ovenOwnerContract: option(contract(unit)) = Tezos.get_contract_opt(Tezos.sender);
    let ovenOwnerContract: ovenOwnerContract = switch (ovenOwnerContract) {
        | Some(ovenOwnerContract) => ovenOwnerContract
        | None => failwith(errorOvenOwnerDoesNotAcceptDeposits): ovenOwnerContract
    };

    let amountOfXTZToWithdraw = withdrawParameter * 1mutez; // cast nat to tez
    let withdrawXTZOperation = Tezos.transaction(
        (),
        amountOfXTZToWithdraw,
        ovenOwnerContract
    );

    ([
        coreContractOnOvenWithdrawalRequestedOperation,
        withdrawXTZOperation
    ], storage);
}
