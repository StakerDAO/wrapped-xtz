[@inline]
let transfer = ((transferParameter, tokenStorage): (transferParameter, tokenStorage)): (list(operation), tokenStorage) => {
	let isPaused = switch (tokenStorage.paused) {
		| true => (failwith(errorTokenOperationsArePaused): bool)
		| false => false	
	};
	
	let newAllowances = switch(Tezos.sender == transferParameter.from_ || Tezos.self_address == transferParameter.from_ ) {
	   | true => tokenStorage.approvals
	   | false => {
		   let authorized_value = switch (Big_map.find_opt((Tezos.sender, transferParameter.from_), tokenStorage.approvals)) {
				| Some(value) => value
				| None => 0n
			};
			if (authorized_value < transferParameter.value) { 
				(failwith(errorNotEnoughAllowance): allowances)
			}
			else { 
				let newAuthorizeValue = abs(authorized_value - transferParameter.value);
				Big_map.update(
					(Tezos.sender,transferParameter.from_), 
					Some(newAuthorizeValue), 
					tokenStorage.approvals
				); 
			};
	   }
	};
	
	let senderBalance = switch (Big_map.find_opt(transferParameter.from_, tokenStorage.ledger)) {
		| Some(value) => value
		| None => 0n
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
		let receiverBalance = switch (Big_map.find_opt(transferParameter.to_, tokenStorage.ledger)) {
		| Some(value) => value
		| None => 0n
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
		(([]: list(operation)), newStorage)
	};
};