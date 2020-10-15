#include "./parameter.religo"
#include "../../../onOvenDepositReceived/onOvenDepositReceivedInit.religo"
#include "../../../../runEntrypointLambda/composeRunEntrypointLambdaOperation.religo"

/**
 * %default entrypoint of the wXTZ Oven
 * 
 * The only entrypoint of the wXTZ Oven that should be able to receive XTZ deposits.
 * This is necessary to notify the wXTZ Core of any incoming deposits, so it can mint wXTZ accordingly.
 */
let default = ((defaultParameter, storage): (defaultParameter, ovenStorage)): (list(operation), ovenStorage) => {
    let coreContractAddress: address = storage.coreAddress;

    if (Tezos.sender == coreContractAddress) {
        /**
         * If the deposit comes from the wXTZ Core, then do nothing.
         * This prevents an endless core-hook transaction loop
         */
        ([]: list(operation), storage)
    } else {
        /**
         * If the deposit comes from a different address than wXTZ Core,
         * notify the wXTZ Core via the `onDepositReceived` entrypoint.
         * 
         * XTZ Received is sent to wXTZ Core and may be subject to taxation.
         * The wXTZ Core itself is responsible for returning the XTZ back to the respective wXTZ Oven.
         */
        let onOvenDepositReceivedParameter: onOvenDepositReceivedParameter = ();

        let coreRunEntrypointLambdaParameter: runEntrypointLambdaParameter = {
            lambdaName: "onOvenDepositReceived", // TODO: extract the lambda name into a variable
            lambdaParameter: Bytes.pack(onOvenDepositReceivedParameter)
        };

        let coreContractOnDepositReceivedOperation = composeRunEntrypointLambdaOperation((
            coreRunEntrypointLambdaParameter,
            // Send all of the deposited XTZ to wXTZ Core
            Tezos.amount,
            coreContractAddress
        ));

        (
            [coreContractOnDepositReceivedOperation],
            storage
        );
    }
};