type lockParameter = 
[@layout:comb]
{
	confirmed: bool,
	fee: option(nat),
	releaseTime: timestamp,
	secretHash: secretHash,
	to_: address,
	value: nat,
};
