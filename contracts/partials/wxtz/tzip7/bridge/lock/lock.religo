let lock = ((lockParameter, s) : (lockParameter, storage)) : (list (operation), storage) => {
  	// TODO: check status
	let secretHash: hashlock = switch (lockParameter.secretHash) {
		| Some(hashlock) => hashlock
		| None => "ff": bytes
	};
	
	let swapEntry: swap = {
		address_to: lockParameter.address_to,
		address_from: Tezos.sender,
		value: lockParameter.value,
		releaseTime: lockParameter.releaseTime,
	};
	let newSwap = Big_map.add(
		lockParameter.lockId,
		swapEntry,
		s.bridge.swaps
	);
    /**
	 * Constructing the transfer parameters for lock-up of tokens
	 */
	let transfer = {
		address_to: Tezos.self_address,
		address_from: Tezos.sender,
		value: lockParameter.value,
	};
  
 	let senderBalance = switch (Big_map.find_opt(Tezos.sender, s.token.ledger)) {
		| Some(value) => value
		| None => 0n
	};

	if (senderBalance < transfer.value) { (failwith("Not Enough Balance"): (list(operation), storage)); }
	else {
		let newSenderBalance = abs(senderBalance - transfer.value);
		let newTokens = Big_map.update(
			transfer.address_from, 
			Some(newSenderBalance),
			s.token.ledger
		);

		let receiver_balance = switch (Big_map.find_opt (transfer.address_to, s.token.ledger)) {
			|	Some value => value
			|	None       => 0n
		};
		let newTokens = Big_map.update (transfer.address_to, (Some (receiver_balance + transfer.value)), newTokens);

		if (secretHash == "ff": bytes) {
			/**
			 * New swap is saved to storage
			 * Tokens to be transferred are locked
			*/
			let newStorage = { 
				...s, 
				bridge: { 
					...s.bridge,
					swaps: newSwap, 
				},
				token : {
					...s.token,
					ledger: newTokens,
				},
			};
			(([]: list (operation)), newStorage);
		} else {
			/**
			 * New swap is saved to storage
			 * Tokens to be transferred are locked
			 * Hash was revealed and is saved to outcomes
			 */
			let newOutcome = Big_map.add(
				lockParameter.lockId,
				HashRevealed(secretHash),
				s.bridge.outcomes
			);
			let newStorage = { 
				...s, 
				bridge: { 
					...s.bridge,
					swaps: newSwap,
					outcomes: newOutcome,
				}, 
				token : {
					...s.token,
					ledger: newTokens,
				},
			};			
			(([]: list (operation)), newStorage);
		};
	};

};