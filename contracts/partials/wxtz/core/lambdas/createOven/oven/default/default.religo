let default = ((defaultParameter, storage): (defaultParameter, ovenStorage)): (list(operation), ovenStorage) => {
    let coreContractAddress: address = storage.coreAddress;

    if (Tezos.sender == coreContractAddress) {
        // if the deposit comes from the wXTZ Core, then do nothing
        ([]: list(operation), storage)
    } else { 
        let coreContractOnDepositReceived: option(contract(onOvenDepositReceivedParameter)) = Tezos.get_entrypoint_opt("%onOvenDepositReceived", coreContractAddress);

        let coreContractOnDepositReceived = switch (coreContractOnDepositReceived) {
            | None => (failwith(errorCoreContractEntrypointTypeMissmatch): contract(onOvenDepositReceivedParameter))
            | Some(coreContractOnDepositReceived) => coreContractOnDepositReceived
        };

        let coreContractOnDepositReceivedOperation: operation = Tezos.transaction(
            (), 
            0mutez, 
            coreContractOnDepositReceived
        );

        ([coreContractOnDepositReceivedOperation], storage)
    }
};