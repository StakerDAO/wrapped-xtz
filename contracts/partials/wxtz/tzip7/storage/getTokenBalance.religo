#include "../constants.religo"

let getTokenBalance = ((tokenOwner, ledger): (address, ledger)): nat => {
	// balance is a reserved word in Ligo
	let tokenBalance = Big_map.find_opt(tokenOwner, ledger);
	switch (tokenBalance) {
		| Some(tokenBalance) => tokenBalance
		| None => defaultBalance
	};
};