#include "../tzip-7/getBalance/parameter.religo"
#include "../tzip-7/getAllowance/parameter.religo"
#include "../tzip-7/getTotalSupply/parameter.religo"
#include "../tzip-7/bridge/getSwap/parameter.religo"


type requestBalanceParameter = {
    at: contractAddress,
    request: owner,
};

type requestAllowanceParameter = {
    at: contractAddress,
    request: getAllowanceRequest,
};

type requestTotalSupplyParameter = contractAddress;

type requestSwapParameter = {
    at: contractAddress,
    request: getSwapRequest,
};

type parameter = 
| RequestAllowance(requestAllowanceParameter)
| RequestBalance(requestBalanceParameter)
| RequestSwap(requestSwapParameter)
| RequestTotalSupply(requestTotalSupplyParameter)
| Receive(response);
