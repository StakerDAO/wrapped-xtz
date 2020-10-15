type lockParameter = {
	lockId: lockId,
	address_to: address,
	value: nat,
	releaseTime: int,
	secretHash: option(hashlock),
};