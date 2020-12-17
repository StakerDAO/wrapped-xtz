let isSecretLengthBelowThreshold = (secret: secret): bool => {
    let secretByteLength = Bytes.length(secret);
    secretByteLength <= 32n;
};

let failIfSecretTooLong = (secret: secret): unit => {
    let validSecretLength = isSecretLengthBelowThreshold(secret);
    switch (validSecretLength) {
        | true => unit
        | false => (failwith(errorTooLongSecret): unit)
    };
};

let isValidSwapTime = (swap: swap): bool => {
    swap.releaseTime >= Tezos.now;
};

let failIfSwapIsOver = (swap: swap): unit => {
    let isValidSwapTime = isValidSwapTime(swap);
    switch(isValidSwapTime) {
        | true => unit
        | false => (failwith(errorSwapIsOver): unit)
    };
};

let failIfSwapIsNotOver = (swap: swap): unit => {
    let isValidSwapTime = isValidSwapTime(swap);
    switch (isValidSwapTime) {
        | true => (failwith(errorFundsLock): unit)
        | false => unit
    };
};

let isValidSwapTimeInput = (releaseTime: timestamp): bool => {
    let minimumSwapTime = Tezos.now + minimumTimeFrame;
    releaseTime >= minimumSwapTime;
};

/**
 * Check that release time is not close to current time, 
 * so that counter party has enough time to perform the swap.
 */
let failIfInvalidSwapTimeInput = (releaseTime: timestamp): unit => {
    let isValidSwapTimeInput = isValidSwapTimeInput(releaseTime);
    switch (isValidSwapTimeInput) {
        | true => unit
        | false => (failwith(errorSwapTimeBelowThreshold): unit)
    };
};
