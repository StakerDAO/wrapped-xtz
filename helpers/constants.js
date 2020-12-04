module.exports = {
    unit: undefined,
    rpcErrors: {
        michelson: {
            balanceTooLow: "proto.006-PsCARTHA.contract.balance_too_low"
        },
        proto: {
            unregistredDelegate: "(permanent) proto.006-PsCARTHA.contract.manager.unregistered_delegate"
        },
        http: {
            notFound: "Http error response: (404)"
        }
    },
    contractErrors: {
        tzip7: {
            allowanceMismatch: "AllowanceMismatch",
            fundsLock: "FundsLock",
            noPermission: "NoPermission",
            notEnoughAllowance: "NotEnoughAllowance",
            notEnoughBalance: "NotEnoughBalance",
            swapIsNotConfirmed: "SwapIsNotConfirmed",
            swapLockAlreadyExists: "SwapLockAlreadyExists",
            swapLockDoesNotExist: "SwapLockDoesNotExist",
            tokenOperationsPaused: "TokenOperationsArePaused",
            tooLongSecret: "TooLongSecret",
            unsafeAllowanceChange: "UnsafeAllowanceChange",
        },
        core: {
            amountNotZero: '4',
            notAnOvenOwner: '14',
            ovenOwnerDoesNotAcceptDeposits: '15',
            lambdaNotFound: '0',
            lambdaNotAnEntrypoint: '1',
            lambdaParameterWrongType: '2',
            ovenNotTrusted: '6',
            ovenMissingDefaultEntrypoint: '5'
        },
    },
};