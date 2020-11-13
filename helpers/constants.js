module.exports = {
    unit: undefined,
    rpcErrors: {
        michelson: {
            balanceTooLow: "proto.006-PsCARTHA.contract.balance_too_low"
        },
        http: {
            notFound: "Http error response: (404)"
        }
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
            amountNotZero: 4,
            notAnOvenOwner: 14,
        },
    },
};