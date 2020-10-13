#include "./bridge/storage/storage.religo"
#include "./token/storage/storage.religo"
type outcome = unit;//| Refunded | HashRevealed(bytes) | SecretRevealed(bytes);

type storage = {
  token: {
	  ledger: tokens,
	  approvals: allowances,
	  admin: address,
	  paused: bool,
	  totalSupply: nat,
  },
  bridge: {
	  swaps: big_map (lockId, swap),
	  outcomes: big_map (lockId, outcome),
  },
  hashlock	   : big_map (lockId, hashlock),
  status	   : big_map (lockId, status),
  secrets      : big_map (lockId, secret),
}