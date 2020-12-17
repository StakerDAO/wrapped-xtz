#include "../../storage/swapLockRepository.religo"

let isSenderInitiator = (swap: swap): bool => {
    Tezos.sender == swap.from_;
};

let failIfSenderIsNotTheInitiator = ((swapId, swaps): (swapId, swaps)): unit => {
    let swap = getSwapLock(swapId, swaps);
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

let failIfSwapIsNotConfirmed = ((swapId, swaps): (swapId, swaps)): unit => {
    let swap = getSwapLock(swapId, swaps);
    let isSwapConfirmed = isSwapConfirmed(swap);
    switch (isSwapConfirmed) {
        | true => unit
        | false => (failwith(errorSwapIsNotConfirmed): unit)
    };
};

let failIfSwapIsAlreadyConfirmed = ((swapId, swaps): (swapId, swaps)): unit => {
    let swap = getSwapLock(swapId, swaps);
    let isSwapConfirmed = isSwapConfirmed(swap);
    switch (isSwapConfirmed) {
        | true => (failwith(errorSwapIsAlreadyConfirmed): unit)
        | false => unit
    };
};
