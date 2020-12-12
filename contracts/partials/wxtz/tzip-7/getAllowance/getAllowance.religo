let getAllowance = ((getAllowanceParameter, tokenStorage): (getAllowanceParameter, tokenStorage)): tokenEntrypointReturn => {
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
