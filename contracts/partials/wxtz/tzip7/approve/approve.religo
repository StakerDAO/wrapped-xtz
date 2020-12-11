let approve = ((approveParameter, tokenStorage): (approveParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
    // continue only if token operations are not paused
    failIfPaused(tokenStorage);
    // retrieve existing allowance
    let allowance = getTokenAllowance(
        Tezos.sender, // token owner
        approveParameter.spender,
        tokenStorage.approvals
    );
    /**
    * Changing allowance value from a non-zero value to a non-zero value is forbidden
    * to prevent this attack vector https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/
    */
    if (allowance > 0n && approveParameter.value > 0n) {
        (failwith(errorUnsafeAllowanceChange): (entrypointReturn, tokenStorage));
    }
    else {
        // update new allowance from 0 to parameter.value or from previous state value to 0
        let approvals = setTokenAllowance(
        Tezos.sender, // token owner
            approveParameter.spender,
            approveParameter.value,
            tokenStorage.approvals
        );
        let tokenStorage = {
            ...tokenStorage,
            approvals: approvals
        };
        // no operations are returned, only the updated storage
        (emptyListOfOperations, tokenStorage);
    };
};