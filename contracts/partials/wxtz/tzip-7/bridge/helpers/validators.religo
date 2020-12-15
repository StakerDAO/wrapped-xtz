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

let failIfSwapIsNotOver = (swap: swap): unit => {
    let isValidSwapTime = isValidSwapTime(swap);
    switch(isValidSwapTime) {
        | true => (failwith(errorFundsLock): unit)
        | false => unit
    };
};
