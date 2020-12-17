type getSwapParameter = 
[@layout:comb]
{   
    secretHash: secretHash,
    swapInitiator: address,
    callback: contract(swap),
};
