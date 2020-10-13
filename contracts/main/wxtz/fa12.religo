#include "../../partials/wxtz/storage.religo"
#include "../../partials/wxtz/parameter.religo"

#include "../../partials/wxtz/token/transfer/transfer.religo"
#include "../../partials/wxtz/token/getAllowance/getAllowance.religo"
#include "../../partials/wxtz/token/approve/approve.religo"
#include "../../partials/wxtz/token/getBalance/getBalance.religo"
#include "../../partials/wxtz/token/getTotalSupply/getTotalSupply.religo"
#include "../../partials/wxtz/token/mint/mint.religo"

#include "../../partials/wxtz/bridge/status.religo"
#include "../../partials/wxtz/bridge/lock/lock.religo"
#include "../../partials/wxtz/bridge/redeem/redeem.religo"
#include "../../partials/wxtz/bridge/claimRefund/claimRefund.religo"
#include "../../partials/wxtz/bridge/revealSecretHash/revealSecretHash.religo"


let main = ((p,s): (parameter, storage)) =>  
 	switch p {
   	|	Transfer p => transfer ((p,s))
	|	Approve  p => approve ((p,s))
	| 	Mint p => mint ((p,s))
	|	GetAllowance p => getAllowance ((p,s))
	|   GetBalance p => getBalance ((p,s))
	|	GetTotalSupply p => getTotalSupply ((p,s))
	|   Lock p => lock ((p,s))
	|	RevealSecretHash p => revealSecretHash ((p,s))
	|	Redeem p => redeem ((p,s))
	|	ClaimRefund p => (([]: list(operation)), s)
};
