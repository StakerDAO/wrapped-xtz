[@inline]
let transfer = ((transferParameter, tokenStorage): (transferParameter, tokenStorage)): (list(operation), tokenStorage) => {
	let isPaused = switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};
	
	let newAllowances = switch(Tezos.sender == transferParameter.from_ || Tezos.self_address == transferParameter.from_ ) {
	   | true => tokenStorage.approvals
	   | false => {
		   let optionalAuthorizedValue = Big_map.find_opt((Tezos.sender, transferParameter.from_), tokenStorage.approvals);
		   let authorizedValue = switch (optionalAuthorizedValue) {
				| Some(value) => value
				| None => 0n
			};
			if (authorizedValue < transferParameter.value) { 
				(failwith(errorNotEnoughAllowance): allowances)
			}
			else { 
				let newAuthorizeValue = abs(authorizedValue - transferParameter.value);
				Big_map.update(
					(Tezos.sender,transferParameter.from_), 
					Some(newAuthorizeValue), 
					tokenStorage.approvals
				); 
			};
	   }
	};
	let optionalSenderBalance = Big_map.find_opt(transferParameter.from_, tokenStorage.ledger);
	let senderBalance = switch (optionalSenderBalance) {
		| Some(value) => value
		| None => defaultBalance
	};

	if (senderBalance < transferParameter.value) { 
		(failwith(errorNotEnoughBalance): (list(operation), tokenStorage))
	}
	else {
		let newSenderBalance = abs(senderBalance - transferParameter.value);
		let newTokens = Big_map.update(
			transferParameter.from_,
			Some(newSenderBalance),
			tokenStorage.ledger
		);
		let optionalReceiverBalance = Big_map.find_opt(transferParameter.to_, tokenStorage.ledger);
		let receiverBalance = switch (optionalReceiverBalance) {
		| Some(value) => value
		| None => defaultBalance
		};
		let newReceiverBalance = receiverBalance + transferParameter.value;
		let newTokens = Big_map.update(
			transferParameter.to_,
			Some(newReceiverBalance),
			newTokens
		);
		let newStorage = {
				...tokenStorage,
				ledger: newTokens,
				approvals: newAllowances
		};
		(emptyListOfOperations, newStorage)
	};
};