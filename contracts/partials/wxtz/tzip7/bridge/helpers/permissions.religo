#include "../../storage/swapLockRepository.religo"

let isSenderInitiator = (swap: swap): bool => {
    Tezos.sender == swap.from_;
};

let failIfSenderIsNotTheInitiator = ((secretHash, swaps): (secretHash, swaps)): unit => {
    let swap = getSwapLock(secretHash, swaps);
    // check that sender of the transaction has permission
    let isSenderInitiator = isSenderInitiator(swap);
    switch (isSenderInitiator) {
        | true => unit
        | false => (failwith(errorSenderIsNotTheInitiator): unit)
    };
};

let isSwapConfirmed = (swap: swap): bool => {
    swap.confirmed == true;
};

let failIfSwapIsNotConfirmed = ((secretHash, swaps): (secretHash, swaps)): unit => {
    let swap = getSwapLock(secretHash, swaps);
    let isSwapConfirmed = isSwapConfirmed(swap);
    switch (isSwapConfirmed) {
        | true => unit
        | false => (failwith(errorSwapIsNotConfirmed): unit)
    };
};

let failIfSwapIsAlreadyConfirmed = ((secretHash, swaps): (secretHash, swaps)): unit => {
    let swap = getSwapLock(secretHash, swaps);
    let isSwapConfirmed = isSwapConfirmed(swap);
    switch (isSwapConfirmed) {
        | true => (failwith(errorSwapIsAlreadyConfirmed): unit)
        | false => unit
    };
};