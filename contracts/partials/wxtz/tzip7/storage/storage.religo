#include "types.religo"

type tokenStorage = {
  ledger: tokens,
  approvals: allowances,
  admin: address,
  paused: bool,
  totalSupply: nat,
};

type swaps = big_map(lockId, swap);
type outcomes = big_map(lockId, outcome);
type bridgeStorage = {
  swaps: swaps,
  outcomes: outcomes,
};

type storage = {
  token: tokenStorage,
  bridge: bridgeStorage,
};