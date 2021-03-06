#include "types.religo"
#include "getTokenAllowance.religo"
#include "getTokenBalance.religo"
#include "setTokenAllowance.religo"
#include "setTokenBalance.religo"
#include "updateTokenStorageRepository.religo"
#include "swapLockRepository.religo"
#include "setOutcome.religo"

type storage = {
    token: tokenStorage,
    bridge: bridgeStorage,
};
