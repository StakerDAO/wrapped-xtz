type lockId = bytes;
type swap = {
	address_to: address,
	address_from: address,
	value: nat, // in ERC20 called amount
	releaseTime: int,
};
type hashlock = bytes;
type secret = bytes;
type outcome = 
  | Refunded
  | HashRevealed(hashlock) 
  | SecretRevealed(secret);

type tokens = big_map(address, nat)
type allowances = big_map((address, address), nat)