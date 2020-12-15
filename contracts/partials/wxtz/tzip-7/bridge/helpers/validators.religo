let isValidSecretLength = (secret: secret): bool => {
    let secretByteLength = Bytes.length(secret);
    secretByteLength == 32n;
};

let failIfInvalidSecretLength = (secret: secret): unit => {
    let validSecretLength = isValidSecretLength(secret);
    switch (validSecretLength) {
        | true => unit
        | false => (failwith(errorInvalidSecretLength): unit)
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
    switch(isValidSwapTime) {
        | true => (failwith(errorFundsLock): unit)
        | false => unit
    };
};
