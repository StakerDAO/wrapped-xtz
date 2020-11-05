type lockParameter = 
[@layout:comb]
{
	confirmed: bool,
	fee: option(nat),
	releaseTime: timestamp,
	secretHash: secretHash,
	[@annot:to] to_: address,
	value: nat,
};
