type secret = bytes;
type secretHash = bytes;
type swap = {
    confirmed: bool,
    fee: nat,
    [@annot:from] from_: address,
    releaseTime: timestamp,
    [@annot:to] to_: address,
    value: nat,
};
type swaps = big_map(secretHash, swap);
type outcomes = big_map(secretHash, secret);

type ledger = big_map(address, nat);
type approvals = big_map((address, address), nat);

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