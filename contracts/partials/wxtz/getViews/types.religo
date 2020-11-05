#include "../tzip7/storage/types.religo"

type owner = address;
type contractAddress = address;

type getBalanceResponse = nat;
type getAllowanceResponse = nat;
type getTotalSupplyResponse = nat;
type getOutcomeResponse = secret;
type getSwapResponse = swap;

type getAllowanceRequest = {
    owner: address,
    spender: address,
};

type response = 
| GetBalanceResponse(getBalanceResponse)
| GetAllowanceResponse(getAllowanceResponse)
| GetTotalSupplyResponse(getTotalSupplyResponse)
| GetOutcomeResponse(getOutcomeResponse)
| GetSwapResponse(getSwapResponse);