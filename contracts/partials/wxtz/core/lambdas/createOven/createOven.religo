/**
 * Lambda to originate a new wXTZ Oven
 */
((lambdaParameter, storage, lambdaExtras): (lambdaParameter, storage, lambdaExtras)): entrypointReturn => {
    let createOvenParameter: option(createOvenParameter) = Bytes.unpack(lambdaParameter);
    let createOvenParameter: createOvenParameter = switch (createOvenParameter) {
        | None => (failwith(errorLambdaParameterWrongType): createOvenParameter)
        | Some(createOvenParameter) => createOvenParameter
    };

    let ovenOwner: ovenOwner = createOvenParameter.ovenOwner; // TODO: should the oven owner be parametrizable?

    let (ovenOriginationOperation, newOvenAddress): (operation, address) = originateOven((
        Tezos.amount,
        createOvenParameter.delegate,
        ovenOwner,
        lambdaExtras.selfAddress
    ));
    
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

    ([ovenOriginationOperation], storage);
}