type lockId = bytes;
type secretHash = bytes;
type swap = {
	confirmed: bool,
	fee: nat,
	from_: address,
	releaseTime: timestamp,
	secretHash: secretHash,
	to_: address,
	value: nat,
};
type secret = bytes;
type outcome = 
  | Refunded
  | HashRevealed(secretHash) 
  | SecretRevealed(secret);

type tokens = big_map(address, nat)
type allowances = big_map((address, address), nat)