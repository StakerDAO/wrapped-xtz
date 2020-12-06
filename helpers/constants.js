module.exports = {
    unit: undefined,
    rpcErrors: {
        michelson: {
            balanceTooLow: "proto.007-PsDELPH1.contract.balance_too_low"
        },
        proto: {
            unregistredDelegate: "(permanent) proto.007-PsDELPH1.contract.manager.unregistered_delegate"
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
            senderIsNotTheInitiator: "errorSenderIsNotTheInitiator",
            swapIsNotConfirmed: "SwapIsNotConfirmed",
            swapLockAlreadyExists: "SwapLockAlreadyExists",
            swapLockDoesNotExist: "SwapLockDoesNotExist",
            tokenOperationsPaused: "TokenOperationsArePaused",
            tooLongSecret: "TooLongSecret",
            unsafeAllowanceChange: "UnsafeAllowanceChange",
        },
        core: {
            lambdaNotFound: '0',
            lambdaNotAnEntrypoint: '1',
            lambdaParameterWrongType: '2',
            lambdaNotArbitrary: '3',
            amountNotZero: '4',
            ovenMissingDefaultEntrypoint: '5',
            ovenNotTrusted: '6',
            coreContractEntrypointTypeMissmatch: '7',
            arbitraryValueKeyNotFound: '8',
            arbitraryValueWrongType: '9',
            wXTZTokenContractWrongType: '10',
            adminAddressWrongType: '11',
            senderIsNotAdmin: '12',
            ovenNotFound: '13',
            notAnOvenOwner: '14',
            ovenOwnerDoesNotAcceptDeposits: '15',
            invalidOvenOwner: '16'
        },
    },
};
