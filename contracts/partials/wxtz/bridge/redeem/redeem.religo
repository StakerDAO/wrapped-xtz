#include "parameter.religo"

let redeem = ((p,s) : (redeem, storage)) : (list (operation), storage) => {
	
	// check that p.secret is shorter than x
	// otherwise failwith ("TooLongSecret")
	


	// check time
	// otherwise failwith ("SwapIsOver")

	let new_secrets = Big_map.add (p.lockId, p.secret, s.secrets);

	let swap = switch (Big_map.find_opt (p.lockId, s.bridge.swaps)) {
	| Some value => value
	| None 		 => (failwith ("SwapLockDoesNotExist") : swap)
	};

	// check that sha256 of p.secret == swap.secretHash
	// otherwise failwith ("InvalidSecret")	

	let calculatedHash = Crypto.sha256 (p.secret);
	let secretHash = switch (Big_map.find_opt (p.lockId, s.hashlock)) {
		| Some value => value
		| None       => (failwith ("no hash") : bytes)
	};

	if (calculatedHash == secretHash) {
		let transfer : transfer = {
			address_to 		: swap.address_to,
			address_from 	: Tezos.self_address,
			value		    : swap.value
		};
	
		let sender_balance = switch (Big_map.find_opt (transfer.address_from, s.token.ledger)) {
		|	Some value => value
		|	None       => 0n
		};
		// not performing check for enough balance, trusting that the smart contract is not sending around tokens
		let new_tokens = Big_map.update (transfer.address_from, (Some (abs(sender_balance - transfer.value))), s.token.ledger);
		let receiver_balance = switch (Big_map.find_opt (transfer.address_to, s.token.ledger)) {
		|	Some value => value
		|	None       => 0n
		};
		let new_tokens = Big_map.update (transfer.address_to, (Some (receiver_balance + transfer.value)), new_tokens);

		(([]: list (operation)), { ...s, token : { ...s.token, ledger : new_tokens }, secrets: new_secrets });
	} else{
		(failwith ("InvalidSecret") : (list(operation), storage))
	}

	
};