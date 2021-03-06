#include "subtraction.religo"

/**
 * Retrieve pause state from storage.
 */
let isPaused = (tokenStorage: tokenStorage): bool => {
	tokenStorage.paused;
};

/**
 * Throws an error if token operations are paused.
 */
let failIfPaused = (tokenStorage: tokenStorage): unit => {
	let isPaused = isPaused(tokenStorage);
	switch (isPaused) {
		| true => (failwith(errorTokenOperationsArePaused): unit)
		| false => unit	
	};
};

/**
 * Check if transfer spender has the permission to transfer.
 * Either spender is token owner and has enough tokens or
 * spender is not token owner, but was approved with enough allowance.
 */
let canTransfer = ((transferSpender, transferParameter, tokenStorage): (address, transferParameter, tokenStorage)): unit  => {
    let transferSpenderIsNotOwner = transferSpender != transferParameter.from_;
    let senderBalance = getTokenBalance(transferParameter.from_, tokenStorage.ledger);
    // Ligo compiler does not allow to have 2x fails in the same if/else statement.
    if (transferSpenderIsNotOwner) {
        let allowance = getTokenAllowance(transferParameter.from_, transferSpender, tokenStorage.approvals);
        failForNegativeAllowanceDifference(allowance, transferParameter.value);
    } else {
        ();
    };
    failForNegativeBalanceDifference(senderBalance, transferParameter.value);
};


let isAdmin = (tokenStorage: tokenStorage): bool => {
    Tezos.sender == tokenStorage.admin;
};

let failIfNotAdmin = (tokenStorage: tokenStorage): unit => {
    let isAdmin = isAdmin(tokenStorage);
    switch(isAdmin) {
        | true => unit
        | false => (failwith(errorSenderIsNotAdmin): unit)
    };
};

let isPauseGuardian = (tokenStorage: tokenStorage): bool => {
    Tezos.sender == tokenStorage.pauseGuardian;
};

let failIfNotPauseGuardian = (tokenStorage: tokenStorage): unit => {
    let isPauseGuardian = isPauseGuardian(tokenStorage);
    switch(isPauseGuardian) {
        | true => unit
        | false => (failwith(errorSenderIsNotPauseGuardian): unit)
    };
};
