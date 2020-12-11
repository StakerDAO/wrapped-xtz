#include "types.religo"
#include "getTokenBalance.religo"
#include "setTokenBalance.religo"
#include "../helpers/subtraction.religo"
#include "../transfer/parameter.religo"
#include "../burn/parameter.religo"
#include "../mint/parameter.religo"

let updateTokenStorage = ((ledger, totalSupply, tokenStorage): (ledger, nat, tokenStorage)): tokenStorage => {
    let tokenStorage = {
        ...tokenStorage,
        ledger: ledger,
        totalSupply: totalSupply,
    };
    tokenStorage;
};

/**
 * Reduces both the balance for given token owner and the total token supply.
 * It fails in case the token owner has not enough balance to be reduced.
 */
let updateTokenStorageByBurn = ((burnParameter, tokenStorage): (burnParameter, tokenStorage)): tokenStorage => {
    // reduce token balance
    let owner = burnParameter.from_;
    let tokenBalance = getTokenBalance(owner, tokenStorage.ledger);
    let reducedTokenBalance = safeBalanceSubtraction(tokenBalance, burnParameter.value);
    let ledger = setTokenBalance(
        owner,
        reducedTokenBalance,
        tokenStorage.ledger
    );
    // reduce total supply
    let totalSupply = abs(tokenStorage.totalSupply - burnParameter.value);
    updateTokenStorage(ledger, totalSupply, tokenStorage);
};

/**
 * Increases both the balance for given token owner and also the total token supply.
 */
let updateTokenStorageByMint = ((mintParameter, tokenStorage): (mintParameter, tokenStorage)): tokenStorage => {
    // increase token balance
    let owner = mintParameter.to_;
    let tokenBalance = getTokenBalance(owner, tokenStorage.ledger);
    let increasedTokenBalance = tokenBalance + mintParameter.value;
    let ledger = setTokenBalance(
        owner,
        increasedTokenBalance,
        tokenStorage.ledger
    );
    // increase total supply
    let totalSupply = tokenStorage.totalSupply + mintParameter.value;
    updateTokenStorage(ledger, totalSupply, tokenStorage);
};

/**
 * Reduces the allowance according to how many tokens are transferred.
 * Not to be confused with approve or approveCAS,
 * where allowance values are replaced and no substraction takes place.
 */
let updateApprovalsByTransfer = ((transferParameter, spender, tokenStorage): (transferParameter, address, tokenStorage)): tokenStorage => {
    let owner = transferParameter.from_;
    let allowance = getTokenAllowance(owner, spender, tokenStorage.approvals);
    let reducedAllowance = safeAllowanceSubtraction(allowance, transferParameter.value);
    let approvals = setTokenAllowance(
        owner,
        spender,
        reducedAllowance,
        tokenStorage.approvals
    );
    let tokenStorage = {
        ...tokenStorage,
        approvals: approvals
    };
    tokenStorage;
};

/**
 * Reduces sender's balance and increases receiver's balance 
 * according to the transfer parameters. 
 * Performs an extra check on the sender for enough balance.
 */
let updateLedgerByTransfer = ((transferParameter, tokenStorage): (transferParameter, tokenStorage)): tokenStorage => {
    let senderBalance = getTokenBalance(transferParameter.from_, tokenStorage.ledger);
    let reducedSenderBalance = safeBalanceSubtraction(senderBalance, transferParameter.value);
    let ledger = setTokenBalance(
        transferParameter.from_,
        reducedSenderBalance,
        tokenStorage.ledger
    );
    let receiverBalance = getTokenBalance(transferParameter.to_, ledger);
    let increasedReceiverBalance = receiverBalance + transferParameter.value;
    let ledger = setTokenBalance(
        transferParameter.to_,
        increasedReceiverBalance,
        ledger
    );
    let tokenStorage = {
        ...tokenStorage,
        ledger: ledger
    };
    tokenStorage;
};