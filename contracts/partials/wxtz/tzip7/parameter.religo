#include "./transfer/parameter.religo"
#include "./approve/parameter.religo"
#include "./approveCAS/parameter.religo"
#include "./getAllowance/parameter.religo"
#include "./getBalance/parameter.religo"
#include "./getTotalSupply/parameter.religo"
#include "./mint/parameter.religo"
#include "./burn/parameter.religo"
#include "./setAdministrator/parameter.religo"
#include "./setPause/parameter.religo"
#include "./setPauseGuardian/parameter.religo"

#include "./bridge/lock/parameter.religo"
#include "./bridge/redeem/parameter.religo"
#include "./bridge/claimRefund/parameter.religo"
#include "./bridge/confirmSwap/parameter.religo"
#include "./bridge/getOutcome/parameter.religo"
#include "./bridge/getSwap/parameter.religo"

type parameter =
    | Transfer(transferParameter)
    | Approve(approveParameter)
    | ApproveCAS(approveCASParameter)
    | Mint(mintParameter)
    | Burn(burnParameter)
    | SetAdministrator(setAdministratorParameter)
    | SetPauseGuardian(setPauseGuardianParameter)
    | SetPause(setPauseParameter)
    | GetAllowance(getAllowanceParameter)
    | GetBalance(getBalanceParameter)
    | GetTotalSupply(getTotalSupplyParameter)
    | Lock(lockParameter)
    | Redeem(redeemParameter)
    | ClaimRefund(claimRefundParameter)
    | ConfirmSwap(confirmSwapParameter)
    | GetOutcome(getOutcomeParameter)
    | GetSwap(getSwapParameter);
