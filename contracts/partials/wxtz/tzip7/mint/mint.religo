let mint = ((p,s): (mintParameter, storage)): (list(operation), storage) => {
	if (Tezos.sender == s.token.admin) {
		let value = switch (Big_map.find_opt (p.to_, s.token.ledger)) {
			| Some(value) => value
			| None => 0n
		};

		let newBalance = value + p.value;
		let newTokens = Big_map.update(
			p.to_,
			Some(newBalance),
			s.token.ledger
		);
		let newStorage = {
			...s,
			token: {
				...s.token,
				ledger: newTokens
			}
		};
		(([]: list (operation)), newStorage);
	} else {
		(failwith ("NoPermission"): (list(operation), storage))
	};
};