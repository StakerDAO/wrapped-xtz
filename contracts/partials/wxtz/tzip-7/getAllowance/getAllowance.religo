let getAllowance = ((getAllowanceParameterMichelson, tokenStorage): (getAllowanceParameterMichelson, tokenStorage)): tokenEntrypointReturn => {
    let getAllowanceParameter: getAllowanceParameter = toGetAllowanceParameter(getAllowanceParameterMichelson);
    let allowance = getTokenAllowance(
        getAllowanceParameter.owner,
        getAllowanceParameter.spender,
        tokenStorage.approvals
    );
    let operation = Tezos.transaction(
        allowance,
        0mutez,
        getAllowanceParameter.callback
    );
    ([operation], tokenStorage);
};
