#include "types.religo"
#include "getTokenAllowance.religo"
#include "getTokenBalance.religo"
#include "setTokenAllowance.religo"
#include "setTokenBalance.religo"

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
};

type storage = {
  token: tokenStorage,
  bridge: bridgeStorage,
};