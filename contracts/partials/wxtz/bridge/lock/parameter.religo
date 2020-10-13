#include "../storage/types.religo"

type lock = {
	lockId 		: lockId,
	address_to 	: address,
	value		: nat, // in ERC20 called amount
	releaseTime	: int,
	secretHash	: option (hashlock),
}