type lockParameter = {
	lockId: lockId,
	releaseTime: timestamp,
	secretHash: option(secretHash),
	to_: address,
	value: nat,
};