type lockParameter = {
	lockId: lockId,
	to_: address,
	value: nat,
	releaseTime: timestamp,
	secretHash: option(hashlock),
};