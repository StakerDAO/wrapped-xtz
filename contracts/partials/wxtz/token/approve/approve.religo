#include "parameter.religo"

let approve = ((p,s) : (approve, storage)) : (list (operation), storage) => {
	let previous_value = switch (Big_map.find_opt ((p.spender, Tezos.sender), s.token.approvals)){
	|	Some value => value
	|	None => 0n
	};
	if (previous_value > 0n && p.value > 0n)
	{ (failwith ("Unsafe Allowance Change") : (list (operation), storage)); }
	else {
		let new_allowances = Big_map.update ((p.spender, Tezos.sender), (Some (p.value)), s.token.approvals);
		(([] : list (operation)), { ...s, token : { ...s.token, approvals : new_allowances }});
	};
};