type lockParameter = {
	lockId: lockId,
	value: nat,
	releaseTime: timestamp,
	secretHash: option(secretHash),
	to_: address,
};