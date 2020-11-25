[@inline]
let transfer = ((transferParameter, tokenStorage): (transferParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	let isPaused = switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};
	
	/**
	 * If sender or this contract is not the owner of the tokens to be transferred,
	 * check for approved allowances in token storage.
	 * In case an allowance needs to be used, reduce the allowance by the amount of tokens
	 * to be transferred.
	 */ 
	let senderIsTokenOwner = Tezos.sender == transferParameter.from_;
	let thisContractIsTokenOwner = Tezos.self_address == transferParameter.from_;
	let newAllowances = switch(senderIsTokenOwner || thisContractIsTokenOwner) {
	   | true => tokenStorage.approvals
	   | false => {
		   let authorizedValue = Big_map.find_opt(
			   (transferParameter.from_, Tezos.sender),
			   tokenStorage.approvals
			);
		   let authorizedValue = switch (authorizedValue) {
				| Some(value) => value
				| None => 0n
			};
			if (authorizedValue < transferParameter.value) { 
				(failwith(errorNotEnoughAllowance): allowances)
			}
			else { 
				let newAuthorizeValue = abs(authorizedValue - transferParameter.value);
				Big_map.update(
					(transferParameter.from_, Tezos.sender), 
					Some(newAuthorizeValue), 
					tokenStorage.approvals
				); 
			};
	   }
	};

	// retrieve sender's balance from token ledger
	let senderBalance = Big_map.find_opt(transferParameter.from_, tokenStorage.ledger);
	let senderBalance = switch (senderBalance) {
		| Some(value) => value
		| None => defaultBalance
	};

	if (senderBalance < transferParameter.value) { 
		(failwith(errorNotEnoughBalance): (entrypointReturn, tokenStorage))
	}
	else {
		// update balances of sender and receiver according to the amount to be transferred
		let newSenderBalance = abs(senderBalance - transferParameter.value);
		let newTokens = Big_map.update(
			transferParameter.from_,
			Some(newSenderBalance),
			tokenStorage.ledger
		);
		let receiverBalance = Big_map.find_opt(transferParameter.to_, newTokens);
		let receiverBalance = switch (receiverBalance) {
			| Some(value) => value
			| None => defaultBalance
		};
		let newReceiverBalance = receiverBalance + transferParameter.value;
		let newTokens = Big_map.update(
			transferParameter.to_,
			Some(newReceiverBalance),
			newTokens
		);
		// save new balances and allowances in token ledger and approvals
		let newStorage = {
			...tokenStorage,
			ledger: newTokens,
			approvals: newAllowances
		};
		// no operations are returned, only the updated token storage
		(emptyListOfOperations, newStorage);
	};
};