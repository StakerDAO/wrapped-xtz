type lockId = bytes;
type swap = {
	to_: address,
	from_: address,
	value: nat, // in ERC20 called amount
	releaseTime: timestamp,
};
type hashlock = bytes;
type secret = bytes;
type outcome = 
  | Refunded
  | HashRevealed(hashlock) 
  | SecretRevealed(secret);

type tokens = big_map(address, nat)
type allowances = big_map((address, address), nat)