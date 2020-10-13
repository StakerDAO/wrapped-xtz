#include "parameter.religo"
#include "../../storage.religo"

let transfer = ((p,s) : (transfer, storage)) : (list (operation), storage) => {
   let new_allowances =   
		if (Tezos.sender == p.address_from) { s.token.approvals; }
		else {
			let authorized_value = switch (Big_map.find_opt ((Tezos.sender,p.address_from), s.token.approvals)) {
			|	Some value => value
			|	None       => 0n
			};
			if (authorized_value < p.value) { (failwith ("Not Enough Allowance") : allowances); }
			else { Big_map.update ((Tezos.sender,p.address_from), (Some (abs(authorized_value - p.value))), s.token.approvals); };
		};
	let sender_balance = switch (Big_map.find_opt (p.address_from, s.token.ledger)) {
	|	Some value => value
	|	None       => 0n
	};
	if (sender_balance < p.value) { (failwith ("Not Enough Balance") : (list (operation), storage)); }
	else {
		let new_tokens = Big_map.update (p.address_from, (Some (abs(sender_balance - p.value))), s.token.ledger);
		let receiver_balance = switch (Big_map.find_opt (p.address_to, s.token.ledger)) {
		|	Some value => value
		|	None       => 0n
		};
		let new_tokens = Big_map.update (p.address_to, (Some (receiver_balance + p.value)), new_tokens);
		(([]: list (operation)), { ...s, token : { ...s.token, ledger : new_tokens, approvals : new_allowances}});
	};
};