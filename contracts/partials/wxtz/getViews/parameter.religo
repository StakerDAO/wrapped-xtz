#include "../tzip7/getBalance/parameter.religo"
#include "../tzip7/getAllowance/parameter.religo"
#include "../tzip7/getTotalSupply/parameter.religo"
#include "../tzip7/bridge/getOutcome/parameter.religo"
#include "../tzip7/bridge/getSwap/parameter.religo"


type requestBalanceParameter = {
    at: contractAddress,
    request: owner,
};

type requestAllowanceParameter = {
    at: contractAddress,
    request: getAllowanceRequest,
};

type requestTotalSupplyParameter = contractAddress;

type requestOutcomeParameter = {
    at: contractAddress,
    request: secretHash,
};
type requestSwapParameter = {
    at: contractAddress,
    request: secretHash,
};

type parameter = 
| RequestAllowance(requestAllowanceParameter)
| RequestBalance(requestBalanceParameter)
| RequestOutcome(requestOutcomeParameter)
| RequestSwap(requestSwapParameter)
| RequestTotalSupply(requestTotalSupplyParameter)
| Receive(response);