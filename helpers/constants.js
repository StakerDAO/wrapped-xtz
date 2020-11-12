module.exports = {
    unit: undefined,
    rpcErrors: {
        michelson: {
            balanceTooLow: "proto.006-PsCARTHA.contract.balance_too_low"
        },
    },
    contractErrors: {
        tzip7: {
            noPermission: "NoPermission",
            notEnoughAllowance: "NotEnoughAllowance",
            notEnoughBalance: "NotEnoughBalance",
            swapLockAlreadyExists: "SwapLockAlreadyExists",
            swapLockDoesNotExist: "SwapLockDoesNotExist",
            tokenOperationsPaused: "TokenOperationsArePaused",
            tooLongSecret: "TooLongSecret",
            unsafeAllowanceChange: "UnsafeAllowanceChange",
        },
        core: {
            notAnOvenOwner: 13,
        },
    },
};