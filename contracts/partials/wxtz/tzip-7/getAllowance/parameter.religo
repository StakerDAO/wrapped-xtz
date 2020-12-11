type getAllowanceParameter = 
[@layout:comb]
{
    owner: address,
    spender: address,
    callback: contract(nat),
};