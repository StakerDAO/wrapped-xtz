#include "parameter.religo"

let getAllowance = ((p,s) : (getAllowance, storage)) : (list (operation), storage) => {
	let value = switch (Big_map.find_opt ((p.owner, p.spender), s.token.approvals)) {
	|	Some value => value
	|	None => 0n
	};
	let op = Tezos.transaction (value, 0mutez, p.callback);
	([op],s)
};