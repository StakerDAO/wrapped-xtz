#include "types.religo"

type tokenStorage = {
  ledger: ledger,
  approvals: approvals,
  admin: address,
  pauseGuardian: address,
  paused: bool,
  totalSupply: nat,
};

type bridgeStorage = {
  swaps: swaps,
  outcomes: outcomes,
  lockSaver: address,
};

type storage = {
  token: tokenStorage,
  bridge: bridgeStorage,
};