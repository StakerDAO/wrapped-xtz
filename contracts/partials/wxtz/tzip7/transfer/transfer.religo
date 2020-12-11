#include "../helpers/permissions.religo"
#include "../helpers/subtraction.religo"

/**
 * Reduces the allowance according to how many tokens are transferred.
 * Not to be confused with approve or approveCAS,
 * where allowance values are replaced and no substraction takes place.
 */
let updateApprovalsByTransfer = ((owner, spender, value, approvals): (address, address, nat, approvals)): approvals => {
	let allowance = getTokenAllowance(owner, spender, approvals);
	let reducedAllowance = safeAllowanceSubtraction(allowance, value);
	setTokenAllowance(
		owner,
		spender,
		reducedAllowance,
		approvals
	);
};

/**
 * Reduces sender's balance and increases receiver's balance 
 * according to the transfer parameters. 
 * Performs an extra check on the sender for enough balance.
 */
let updateLedgerByTransfer = ((transferParameter, ledger): (transferParameter, ledger)): ledger => {
	let senderBalance = getTokenBalance(transferParameter.from_, ledger);
	let reducedSenderBalance = safeBalanceSubtraction(senderBalance, transferParameter.value);
	let ledger = Big_map.update(
		transferParameter.from_,
		Some(reducedSenderBalance),
		ledger
	);
	let receiverBalance = getTokenBalance(transferParameter.to_, ledger);
	let increasedReceiverBalance = receiverBalance + transferParameter.value;
	Big_map.update(
		transferParameter.to_,
		Some(increasedReceiverBalance),
		ledger
	);
};

[@inline] let transfer = ((transferParameter, tokenStorage): (transferParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);
	// check for enough balance or allowance
	let transferSpender = Tezos.sender;
	canTransfer(transferSpender, transferParameter, tokenStorage);
	/**
	 * If spender of transfer is not the owner of the tokens to be transferred, check for approved allowances in token storage.
	 * In case an allowance needs to be used, reduce the allowance by the amount of tokens to be transferred.
	 */ 
	let transferSpenderIsOwner = transferSpender == transferParameter.from_;
	let approvals = switch (transferSpenderIsOwner) {
		| true => tokenStorage.approvals // do nothing
		| false => updateApprovalsByTransfer(
			transferParameter.from_, 
			transferSpender, 
			transferParameter.value, 
			tokenStorage.approvals
		)
	};
	// update balances of sender and receiver according to the amount to be transferred
	let ledger = updateLedgerByTransfer(transferParameter, tokenStorage.ledger);
	// save new balances and approvals in ledger and approvals
	let tokenStorage = {
		...tokenStorage,
		ledger: ledger,
		approvals: approvals
	};
	// no operations are returned, only the updated token storage
	(emptyListOfOperations, tokenStorage);
};