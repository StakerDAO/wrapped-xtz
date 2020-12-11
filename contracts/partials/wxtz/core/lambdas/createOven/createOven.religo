/**
 * Lambda to originate a new wXTZ Oven
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    // Unpack the generic bytes parameter to the form/type required by this lambda
    let createOvenParameter: option(createOvenParameter) = Bytes.unpack(lambdaParameter);
    let createOvenParameter: createOvenParameter = switch (createOvenParameter) {
        | None => (failwith(errorLambdaParameterWrongType): createOvenParameter)
        | Some(createOvenParameter) => createOvenParameter
    };

    /**
     * Address that will be set at the `owner` for the newly created wXTZ Oven
     * // TODO: should the oven owner be parametrizable?
     */
    let ovenOwner: ovenOwner = createOvenParameter.ovenOwner;

    // validate the proposed ovenOwner address
    failIfInvalidOvenOwner(ovenOwner, storage, lambdaExtras);

    // Compose the origination operation and get the newly orignated wXTZ Oven address
    let (ovenOriginationOperation, newOvenAddress): (operation, address) = originateOven((
        // Send all the XTZ received to the newly created wXTZ Oven
        Tezos.amount,
        // Set a delegate for the wXTZ Oven
        createOvenParameter.delegate,
        // Set an owner who will later be able to withdraw XTZ
        ovenOwner,
        /**
         * Initialize the wXTZ Oven with the address of the wXTZ Core contract who originated it
         * so it can send call respective hooks when important operations happen
         */
        lambdaExtras.selfAddress
    ));
    
    /**
     * Add the newly originate wXTZ Oven's address to the wXTZ Core's storage
     */
    let ovens: ovens = storage.ovens;
    let ovens: ovens = Big_map.update(
        newOvenAddress,
        Some(ovenOwner),
        ovens
    );

    let storage: storage = {
        ...storage,
        ovens: ovens
    };

    /**
     * Compose the minting operation on the wXTZ Token contract
     */
    let composeMintOperationParameter: composeMintOperationParameter = {
        to_: ovenOwner,
        value: Tezos.amount / 1mutez // TODO: extract as tezToNat(tez)
    };
    let composeMintOperationParameter: arbitraryValueLambdaParameter = Bytes.pack(composeMintOperationParameter);
    let (mintWXTZOperationList, _, _) = runArbitraryValueLambda((
        {
            lambdaName: "arbitrary/composeMintOperation",
            lambdaParameter: composeMintOperationParameter,
        },
        storage
    ));

    (
        [
            ovenOriginationOperation,
            ...mintWXTZOperationList
        ],
        storage
    );
}