let isValidSecretLength = (secret: secret): bool => {
    let secretByteLength = Bytes.length(secret);
    secretByteLength == fixedSecretByteLength;
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

let failIfSwapIsNotOver = (swap: swap): unit => {
    let isValidSwapTime = isValidSwapTime(swap);
    switch(isValidSwapTime) {
        | true => (failwith(errorFundsLock): unit)
        | false => unit
    };
};
