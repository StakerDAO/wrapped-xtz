#include "types.religo"

type tokenStorage = {
  ledger: tokens,
  approvals: allowances,
  admin: address,
  pauseGuardian: address,
  paused: bool,
  totalSupply: nat,
};

type bridgeStorage = {
  swaps: swaps,
  outcomes: outcomes,
};

type storage = {
  token: tokenStorage,
  bridge: bridgeStorage,
};