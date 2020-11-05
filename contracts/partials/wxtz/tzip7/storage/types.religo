type secret = bytes;
type secretHash = bytes;
type swap = {
	confirmed: bool,
	fee: nat,
	[@annot:from] from_: address,
	releaseTime: timestamp,
	[@annot:to] to_: address,
	value: nat,
};
type swaps = big_map(secretHash, swap);
type outcomes = big_map(secretHash, secret);

type tokens = big_map(address, nat);
type allowances = big_map((address, address), nat);