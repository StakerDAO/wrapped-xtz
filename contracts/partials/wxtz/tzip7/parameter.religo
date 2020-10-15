#include "./transfer/parameter.religo"
#include "./approve/parameter.religo"
#include "./getAllowance/parameter.religo"
#include "./getBalance/parameter.religo"
#include "./getTotalSupply/parameter.religo"
#include "./mint/parameter.religo"

#include "./bridge/lock/parameter.religo"
#include "./bridge/revealSecretHash/parameter.religo"
#include "./bridge/redeem/parameter.religo"
#include "./bridge/claimRefund/parameter.religo"

type parameter =
    | Transfer(transferParameter)
    | Approve(approveParameter)
    | Mint(mintParameter)
    | SetAdministrator(address)
    | SetPause(bool)
    | GetAllowance(getAllowanceParameter)
    | GetBalance(getBalanceParameter)
    | GetTotalSupply(getTotalSupplyParameter)
    | Lock(lockParameter)
    | RevealSecretHash(revealSecretHashParameter)
    | Redeem(redeemParameter)
    | ClaimRefund(claimRefundParameter);
