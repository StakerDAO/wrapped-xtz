#include "types.religo"

type tokenStorage = {
  ledger: tokens,
  approvals: allowances,
  admin: address,
  pauseGuardian: address,
  paused: bool,
  totalSupply: nat,
};

type swaps = big_map(secretHash, swap);
type outcomes = big_map(secretHash, secret);
type bridgeStorage = {
  swaps: swaps,
  outcomes: outcomes,
};

type storage = {
  token: tokenStorage,
  bridge: bridgeStorage,
};