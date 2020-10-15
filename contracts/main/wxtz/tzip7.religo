#include "../../partials/wxtz/tzip7/storage/storage.religo"
#include "../../partials/wxtz/tzip7/parameter.religo"

#include "../../partials/wxtz/tzip7/transfer/transfer.religo"
#include "../../partials/wxtz/tzip7/getAllowance/getAllowance.religo"
#include "../../partials/wxtz/tzip7/approve/approve.religo"
#include "../../partials/wxtz/tzip7/getBalance/getBalance.religo"
#include "../../partials/wxtz/tzip7/getTotalSupply/getTotalSupply.religo"
#include "../../partials/wxtz/tzip7/mint/mint.religo"
#include "../../partials/wxtz/tzip7/burn/burn.religo"
#include "../../partials/wxtz/tzip7/setPause/setPause.religo"
#include "../../partials/wxtz/tzip7/setAdministrator/setAdministrator.religo"

#include "../../partials/wxtz/tzip7/bridge/lock/lock.religo"
#include "../../partials/wxtz/tzip7/bridge/redeem/redeem.religo"
#include "../../partials/wxtz/tzip7/bridge/claimRefund/claimRefund.religo"
#include "../../partials/wxtz/tzip7/bridge/revealSecretHash/revealSecretHash.religo"

let main = ((p,s): (parameter, storage)) =>  
	switch (p) {
		| Transfer(transferParameter) => transfer((transferParameter, s))
		| Approve(approveParameter) => approve((approveParameter, s))
		| Mint(mintParameter) => mint((mintParameter, s))
		| Burn(burnParameter) => burn((burnParameter, s))
		| SetAdministrator(address_) => setAdministrator((address_, s))
		| SetPause(bool) => setPause((bool, s))
		| GetAllowance(getAllowanceParameter) => getAllowance((getAllowanceParameter, s))
		| GetBalance(getBalanceParameter) => getBalance((getBalanceParameter, s))
		| GetTotalSupply(getTotalSupplyParameter) => getTotalSupply((getTotalSupplyParameter, s))
		| Lock(lockParameter) => lock((lockParameter, s))
		| RevealSecretHash(revealSecretHashParameter) => revealSecretHash((revealSecretHashParameter, s))
		| Redeem(redeemParameter) => redeem((redeemParameter, s))
		| ClaimRefund(claimRefundParameter) => (([]: list(operation)), s)
};
