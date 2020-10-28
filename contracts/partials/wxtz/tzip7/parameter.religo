#include "./transfer/parameter.religo"
#include "./approve/parameter.religo"
#include "./getAllowance/parameter.religo"
#include "./getBalance/parameter.religo"
#include "./getTotalSupply/parameter.religo"
#include "./mint/parameter.religo"
#include "./burn/parameter.religo"

#include "./bridge/lock/parameter.religo"
#include "./bridge/redeem/parameter.religo"
#include "./bridge/claimRefund/parameter.religo"
#include "./bridge/confirmSwap/parameter.religo"

type parameter =
    | Transfer(transferParameter)
    | Approve(approveParameter)
    | Mint(mintParameter)
    | Burn(burnParameter)
    | SetAdministrator(address)
    | SetPauseGuardian(address)
    | SetPause(bool)
    | GetAllowance(getAllowanceParameter)
    | GetBalance(getBalanceParameter)
    | GetTotalSupply(getTotalSupplyParameter)
    | Lock(lockParameter)
    | Redeem(redeemParameter)
    | ClaimRefund(claimRefundParameter)
    | ConfirmSwap(confirmSwapParameter);
