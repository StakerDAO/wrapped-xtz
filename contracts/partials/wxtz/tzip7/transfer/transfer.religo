let transfer = ((p,s): (transferParameter, storage)): (list(operation), storage) => {
   let newAllowances =   
		if (Tezos.sender == p.from_) { s.token.approvals; }
		else {
			let authorized_value = switch (Big_map.find_opt((Tezos.sender,p.from_), s.token.approvals)) {
				| Some(value) => value
				| None => 0n
			};
			if (authorized_value < p.value) { (failwith ("Not Enough Allowance"): allowances); }
			else { 
				let newAuthorizeValue = abs(authorized_value - p.value);
				Big_map.update(
					(Tezos.sender,p.from_), 
					Some(newAuthorizeValue), 
					s.token.approvals
				); 
			};
		};
	let senderBalance = switch (Big_map.find_opt(p.from_, s.token.ledger)) {
		| Some(value) => value
		| None => 0n
	};
	if (senderBalance < p.value) { (failwith ("Not Enough Balance"): (list(operation), storage)); }
	else {
		let newSenderBalance = abs(senderBalance - p.value);
		let newTokens = Big_map.update(
			p.from_,
			Some(newSenderBalance),
			s.token.ledger
		);
		let receiverBalance = switch (Big_map.find_opt(p.to_, s.token.ledger)) {
		| Some value => value
		| None       => 0n
		};
		let newReceiverBalance = receiverBalance + p.value;
		let newTokens = Big_map.update(
			p.to_,
			Some(newReceiverBalance),
			newTokens
		);
		let newStorage = {
			...s,
			token: {
				...s.token,
				ledger: newTokens,
				approvals: newAllowances
			}
		};
		(([]: list (operation)), newStorage);
	};
};