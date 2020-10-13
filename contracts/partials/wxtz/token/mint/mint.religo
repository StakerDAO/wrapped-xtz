#include "parameter.religo"

let mint = ((p,s) : (mint, storage)) : (list (operation), storage) => {
	// TODO
	// needs to fail if not the admin is sending
	let value = switch (Big_map.find_opt (p.address_to, s.token.ledger)) {
		| Some value => value
		| None => 0n
	};

	let new_value = value + p.value;
	let new_tokens = Big_map.update (p.address_to, (Some (new_value)), s.token.ledger);
	
	(([]: list (operation)), { ...s, token : { ...s.token, ledger : new_tokens }});
};