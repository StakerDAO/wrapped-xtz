type lockId = bytes;
type swap = {
	address_to 	 : address,
	address_from : address,
	value		 : nat, // in ERC20 called amount
	releaseTime	 : int,
};
type hashlock = bytes;
type status = string;
type secret = bytes;
//type outcome should be here