/**
 * Lambda to originate a new wXTZ Oven
 */
((lambdaParameter, storage): (lambdaParameter, storage)): entrypointReturn => {
    let createOvenParameter: option(createOvenParameter) = Bytes.unpack(lambdaParameter);
    let createOvenParameter: createOvenParameter = switch (createOvenParameter) {
        | None => (failwith(errorLambdaParameterWrongType): createOvenParameter)
        | Some(createOvenParameter) => createOvenParameter
    };

    let ovenOwner: ovenOwner = Tezos.sender; // should the oven owner be parametrizable?

    let (ovenOriginationOperation, newOvenAddress): (operation, address) = originateOven((
        Tezos.amount,
        createOvenParameter.delegate,
        ovenOwner
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