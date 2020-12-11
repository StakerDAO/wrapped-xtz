#include "../errors.religo"

/*
 * These helper functions check, whether the result of a substraction
 * is negative or positive and fails with the associated error message
 * following the TZIP-7 specification.
 */
let failForNegativeBalanceDifference = ((a, b): (nat, nat)): unit => {
    let positiveDifference = a >= b;
    switch (positiveDifference) {
        | true => unit
        | false => (failwith(errorNotEnoughBalance): unit)
    }
};
let failForNegativeAllowanceDifference = ((a, b): (nat, nat)): unit => {
    let positiveDifference = a >= b;
    switch (positiveDifference) {
        | true => unit
        | false => (failwith(errorNotEnoughAllowance): unit)
    }
};

/**
 * ABS is necessary for type casting to nat after a substraction in Ligo.
 * This is error prone if the result of the substraction is negative,
 * hence these helper functions.
 */
let safeAllowanceSubtraction = ((a, b): (nat, nat)): nat => {
    failForNegativeAllowanceDifference(a, b);
    abs(a - b);
};
let safeBalanceSubtraction = ((a, b): (nat, nat)): nat => {
    failForNegativeBalanceDifference(a, b);
    abs(a - b);
};
