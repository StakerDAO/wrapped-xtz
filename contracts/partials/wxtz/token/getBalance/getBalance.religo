#include "parameter.religo"

let getBalance = ((p,s) : (getBalance, storage)) : (list (operation), storage) => {
	let value = switch (Big_map.find_opt (p.owner, s.token.ledger)) {
	|	Some value => value
	|	None => 0n
	};
	let op = Tezos.transaction (value, 0mutez, p.callback);
	([op],s)
};