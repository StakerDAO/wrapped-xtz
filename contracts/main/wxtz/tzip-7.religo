#include "../../partials/wxtz/tzip-7/storage/storage.religo"
#include "../../partials/wxtz/tzip-7/parameter.religo"
#include "../../partials/wxtz/tzip-7/errors.religo"
#include "../../partials/wxtz/tzip-7/constants.religo"
#include "../../partials/wxtz/tzip-7/returnTypes.religo"

#include "../../partials/wxtz/tzip-7/transfer/transfer.religo"
#include "../../partials/wxtz/tzip-7/getAllowance/getAllowance.religo"
#include "../../partials/wxtz/tzip-7/approve/approve.religo"
#include "../../partials/wxtz/tzip-7/approveCAS/approveCAS.religo"
#include "../../partials/wxtz/tzip-7/getBalance/getBalance.religo"
#include "../../partials/wxtz/tzip-7/getTotalSupply/getTotalSupply.religo"
#include "../../partials/wxtz/tzip-7/mint/mint.religo"
#include "../../partials/wxtz/tzip-7/burn/burn.religo"
#include "../../partials/wxtz/tzip-7/setAdministrator/setAdministrator.religo"
#include "../../partials/wxtz/tzip-7/setPauseGuardian/setPauseGuardian.religo"
#include "../../partials/wxtz/tzip-7/setPause/setPause.religo"

#include "../../partials/wxtz/tzip-7/bridge/lock/lock.religo"
#include "../../partials/wxtz/tzip-7/bridge/redeem/redeem.religo"
#include "../../partials/wxtz/tzip-7/bridge/claimRefund/claimRefund.religo"
#include "../../partials/wxtz/tzip-7/bridge/confirmSwap/confirmSwap.religo"
#include "../../partials/wxtz/tzip-7/bridge/getSwap/getSwap.religo"

let main = ((parameter, storage): (parameter, storage)) =>  
    switch (parameter) {
    | Transfer(transferParameter) => {
        let (operations, tokenStorage) = transfer((transferParameter, storage.token));
        (operations, {
            ...storage,
            token: tokenStorage
        })
    }
    | Approve(approveParameter) => {
        let (operations, tokenStorage) = approve((approveParameter, storage.token));
        (operations, {
            ...storage,
            token: tokenStorage
        })
    }
    | ApproveCAS(approveCASParameter) => {
        let (operations, tokenStorage) = approveCAS((approveCASParameter, storage.token));
        (operations, {
            ...storage,
            token: tokenStorage
        })
    }  
    | Mint(mintParameter) => {
        let (operations, tokenStorage) = mint((mintParameter, storage.token));
        (operations, {
            ...storage,
            token: tokenStorage
        })
    } 
    | Burn(burnParameter) => {
        let (operations, tokenStorage) = burn((burnParameter, storage.token));
        (operations, {
            ...storage,
            token: tokenStorage
        })
    }
    | SetAdministrator(address_) => {
        let (operations, tokenStorage) = setAdministrator((address_, storage.token));
        (operations, {
            ...storage,
            token: tokenStorage
        })
    }
    | SetPauseGuardian(address_) => {
        let (operations, tokenStorage) = setPauseGuardian((address_, storage.token));
        (operations, {
            ...storage,
            token: tokenStorage
        })
    } 
    | SetPause(bool) => {
        let (operations, tokenStorage) = setPause((bool, storage.token));
        (operations, {
            ...storage,
            token: tokenStorage
        })
    }
    | GetAllowance(getAllowanceParameter) => {
        let (operations, _) = getAllowance((getAllowanceParameter, storage.token));
        (operations: list(operation), storage)
    }
    | GetBalance(getBalanceParameter) => {
        let (operations, _) = getBalance((getBalanceParameter, storage.token));
        (operations: list(operation), storage)
    }
    | GetTotalSupply(getTotalSupplyParameter) => {
        let (operations, _) = getTotalSupply((getTotalSupplyParameter, storage.token));
        (operations: list(operation), storage)
    }
    | Lock(lockParameter) => lock((lockParameter, storage))
    | Redeem(redeemParameter) => redeem((redeemParameter, storage))
    | ClaimRefund(claimRefundParameter) => claimRefund((claimRefundParameter, storage))
    | ConfirmSwap(confirmSwapParameter) => {
        let (operations, bridgeStorage) = confirmSwap((confirmSwapParameter, storage.bridge));
        (operations, {
            ...storage,
            bridge: bridgeStorage
        })
    }
    | GetSwap(getSwapParameter) => {
        let (operations, _) = getSwap((getSwapParameter, storage.bridge));
        (operations: list(operation), storage)
    }
};
