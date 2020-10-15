let mint = ((p,s): (mintParameter, storage)): (list(operation), storage) => {
	// TODO
	// needs to fail if not the admin is sending
	let value = switch (Big_map.find_opt (p.address_to, s.token.ledger)) {
		| Some(value) => value
		| None => 0n
	};

	let newBalance = value + p.value;
	let newTokens = Big_map.update(
		p.address_to,
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
};