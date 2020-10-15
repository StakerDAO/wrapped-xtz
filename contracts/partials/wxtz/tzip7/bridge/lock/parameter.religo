type lockParameter = {
	lockId: lockId,
	value: nat,
	releaseTime: timestamp,
	secretHash: option(hashlock),
	to_: address,
};