#include "types.religo"

type tokenStorage = {
  ledger: tokens,
  approvals: allowances,
  admin: address,
  paused: bool,
  totalSupply: nat,
};

type bridgeStorage = {
  swaps: big_map(lockId, swap),
  outcomes: big_map(lockId, outcome),
};

type storage = {
  token: tokenStorage,
  bridge: bridgeStorage,
};