#include "../tzip-7/storage/types.religo"

type owner = address;
type contractAddress = address;

type getBalanceResponse = nat;
type getAllowanceResponse = nat;
type getTotalSupplyResponse = nat;
type getSwapResponse = swap;

type getAllowanceRequest = {
    owner: address,
    spender: address,
};

type response = 
| GetBalanceResponse(getBalanceResponse)
| GetAllowanceResponse(getAllowanceResponse)
| GetTotalSupplyResponse(getTotalSupplyResponse)
| GetSwapResponse(getSwapResponse);
