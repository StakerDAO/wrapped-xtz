let approve = ((p,s) : (approveParameter, storage)) : (list(operation), storage) => {
	let previousState = switch (Big_map.find_opt ((p.spender, Tezos.sender), s.token.approvals)){
	| Some value => value
	| None => 0n
	};
	if (previousState > 0n && p.value > 0n)
	{ (failwith ("Unsafe Allowance Change"): (list(operation), storage)); }
	else {
		let newAllowances = Big_map.update ((p.spender, Tezos.sender), (Some (p.value)), s.token.approvals);
		let newStorage = {
			...s,
			token: {
				...s.token,
				approvals: newAllowances
			},
		};
		(([]: list(operation)), newStorage);
	};
};