let redeem = ((p,s) : (redeemParameter, storage)) : (list (operation), storage) => {
	
	// check that p.secret is shorter than x
	// otherwise failwith ("TooLongSecret")
	


	// check time
	// otherwise failwith ("SwapIsOver")

	let swap = switch (Big_map.find_opt (p.lockId, s.bridge.swaps)) {
	| Some(value) => value
	| None => (failwith ("SwapLockDoesNotExist"): swap)
	};

	// check that sha256 of p.secret == swap.secretHash
	// otherwise failwith ("InvalidSecret")	

	let calculatedHash = Crypto.sha256(p.secret);
	let secretHash = switch (Big_map.find_opt (p.lockId, s.bridge.outcomes)) {
		| Some(outcome) => {
			switch (outcome) {
			| HashRevealed(hashlock) => hashlock
			| SecretRevealed(secret) => (failwith("swap already performed"): hashlock)
			| Refunded(value) => (failwith("no hash"): hashlock)
			}
		}
		| None => (failwith("no hash"): hashlock)
	};


	if (calculatedHash == secretHash) {
		let transfer = {
			address_to: swap.address_to,
			address_from: Tezos.self_address,
			value: swap.value,
		};
	
		let sender_balance = switch (Big_map.find_opt (transfer.address_from, s.token.ledger)) {
		|	Some(value) => value
		|	None => 0n
		};
		// not performing check for enough balance, trusting that the smart contract is not sending around tokens
		let newSenderBalance = abs(sender_balance - transfer.value);
		let newTokens = Big_map.update(
			transfer.address_from,
			Some(newSenderBalance),
			s.token.ledger
		);
		let receiverBalance = switch (Big_map.find_opt(transfer.address_to, s.token.ledger)) {
		| Some(value) => value
		| None => 0n
		};
		let newReceiverBalance = receiverBalance + transfer.value;
		let newTokens = Big_map.update(
			transfer.address_to,
			Some(newReceiverBalance),
			newTokens
		);

		let newOutcome = Big_map.update(
			p.lockId,
			Some(SecretRevealed(p.secret)),
			s.bridge.outcomes
		);

		let newStorage = {
			...s,
			token: {
				...s.token,
				ledger: newTokens
			}, 
			bridge: {
				...s.bridge,
				outcomes: newOutcome
			}
		};
		(([]: list (operation)), newStorage);
	} else{
		(failwith("InvalidSecret"): (list(operation), storage))
	}

	
};