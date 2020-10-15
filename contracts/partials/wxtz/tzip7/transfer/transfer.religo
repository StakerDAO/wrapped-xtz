let transfer = ((p,s) : (transferParameter, storage)) : (list (operation), storage) => {
   let newAllowances =   
		if (Tezos.sender == p.address_from) { s.token.approvals; }
		else {
			let authorized_value = switch (Big_map.find_opt ((Tezos.sender,p.address_from), s.token.approvals)) {
			|	Some value => value
			|	None       => 0n
			};
			if (authorized_value < p.value) { (failwith ("Not Enough Allowance") : allowances); }
			else { Big_map.update ((Tezos.sender,p.address_from), (Some (abs(authorized_value - p.value))), s.token.approvals); };
		};
	let sender_balance = switch (Big_map.find_opt(p.address_from, s.token.ledger)) {
	|	Some value => value
	|	None       => 0n
	};
	if (sender_balance < p.value) { (failwith ("Not Enough Balance") : (list (operation), storage)); }
	else {
		let newTokens = Big_map.update (p.address_from, (Some (abs(sender_balance - p.value))), s.token.ledger);
		let receiverBalance = switch (Big_map.find_opt (p.address_to, s.token.ledger)) {
		|	Some value => value
		|	None       => 0n
		};
		let newReceiverBalance = receiverBalance + p.value;
		let newTokens = Big_map.update(
			p.address_to,
			Some (newReceiverBalance),
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