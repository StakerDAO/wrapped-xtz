#include "../../storage/swapLockRepository.religo"

/**
 * This is basically getSwapLock() with a different error message.
 */
let failIfSenderIsNotTheInitiator = ((swapId, swaps): (swapId, swaps)): unit => {
    let swap = Big_map.find_opt(swapId, swaps);
    switch (swap) {
        | Some(swap) => unit
        | None => (failwith(errorSenderIsNotTheInitiator): unit)
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
