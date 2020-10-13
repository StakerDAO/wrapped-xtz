#include "./token/transfer/parameter.religo"
#include "./token/approve/parameter.religo"
#include "./token/getAllowance/parameter.religo"
#include "./token/getBalance/parameter.religo"
#include "./token/getTotalSupply/parameter.religo"
#include "./token/mint/parameter.religo"

#include "./bridge/lock/parameter.religo"
#include "./bridge/revealSecretHash/parameter.religo"
#include "./bridge/redeem/parameter.religo"
#include "./bridge/claimRefund/parameter.religo"


type parameter =
|	Transfer       	 ( transfer )
|	Approve        	 ( approve )
|	GetAllowance   	 ( getAllowance )
|	GetBalance     	 ( getBalance )
|	GetTotalSupply 	 ( getTotalSupply )
|   Lock 		   	 ( lock )
|	RevealSecretHash ( revealSecretHash )
|	Redeem			 ( redeem )
|	ClaimRefund 	 ( claimRefund )
| 	Mint			 ( mint )