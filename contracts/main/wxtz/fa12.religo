//#include "../partials/status.religo"

type tokens = big_map (address, nat)
type allowances = big_map ((address, address), nat) 

type lockId = string;
type swap = {
	address_to 	 : address,
	address_from : address,
	value		 : nat, // in ERC20 called amount
	releaseTime	 : int,
};
type hashlock = string;
type status = string;
type secret = string;

// TODO
// storage needs to split into fa12 storage and bridge storage according to blend specs
type storage = {
  tokens       : tokens,
  allowances   : allowances,
  total_amount : nat,
  swaps 	   : big_map (lockId, swap),
  hashlock	   : big_map (lockId, hashlock),
  status	   : big_map (lockId, status),
  secrets      : big_map (lockId, secret),
}

type transfer = {
	address_from : address,
	address_to   : address,
	value        : nat,
}

type approve = {
	spender : address,
	value   : nat,
}

type getAllowance = {
	owner    : address,
	spender  : address,
	callback : contract (nat),
}

type getBalance = {
	owner    : address,
	callback : contract (nat),
}

type getTotalSupply = {
	callback : contract (nat),
}

// cross chain swap
type lock = {
	lockId 		: lockId,
	address_to 	: address,
	value		: nat, // in ERC20 called amount
	releaseTime	: int,
	secretHash	: string,
}

type revealSecretHash = {
	lockId		: lockId,
	secretHash	: string,
}

type redeem = {
	lockId		: lockId,
	secret		: string,
}

type claimRefund = {
	lockId 		: lockId
}

type mint =  {
	address_to : address,
	value : nat
}

type action =
|	Transfer       	 ( transfer )
|	Approve        	 ( approve )
|	GetAllowance   	 ( getAllowance )
|	GetBalance     	 ( getBalance )
|	GetTotalSupply 	 ( getTotalSupply )
|   Lock 		   	 ( lock )
|	RevealSecretHash ( revealSecretHash )
|	Redeem			 ( redeem )
|	ClaimRefund 	 ( claimRefund )
| 	Mint			 ( mint )

let transfer = ((p,s) : (transfer, storage)) : (list (operation), storage) => {
   let new_allowances =   
		if (Tezos.sender == p.address_from) { s.allowances; }
		else {
			let authorized_value = switch (Big_map.find_opt ((Tezos.sender,p.address_from), s.allowances)) {
			|	Some value => value
			|	None       => 0n
			};
			if (authorized_value < p.value) { (failwith ("Not Enough Allowance") : allowances); }
			else { Big_map.update ((Tezos.sender,p.address_from), (Some (abs(authorized_value - p.value))), s.allowances); };
		};
	let sender_balance = switch (Big_map.find_opt (p.address_from, s.tokens)) {
	|	Some value => value
	|	None       => 0n
	};
	if (sender_balance < p.value) { (failwith ("Not Enough Balance") : (list (operation), storage)); }
	else {
		let new_tokens = Big_map.update (p.address_from, (Some (abs(sender_balance - p.value))), s.tokens);
		let receiver_balance = switch (Big_map.find_opt (p.address_to, s.tokens)) {
		|	Some value => value
		|	None       => 0n
		};
		let new_tokens = Big_map.update (p.address_to, (Some (receiver_balance + p.value)), new_tokens);
		(([]: list (operation)), { ...s,tokens:new_tokens, allowances:new_allowances});
	};
};

let approve = ((p,s) : (approve, storage)) : (list (operation), storage) => {
	let previous_value = switch (Big_map.find_opt ((p.spender, Tezos.sender), s.allowances)){
	|	Some value => value
	|	None => 0n
	};
	if (previous_value > 0n && p.value > 0n)
	{ (failwith ("Unsafe Allowance Change") : (list (operation), storage)); }
	else {
		let new_allowances = Big_map.update ((p.spender, Tezos.sender), (Some (p.value)), s.allowances);
		(([] : list (operation)), { ...s, allowances : new_allowances});
	};
};

let mint = ((p,s) : (mint, storage)) : (list (operation), storage) => {
	// TODO
	// needs to fail if not the admin is sending
	let value = switch (Big_map.find_opt (p.address_to, s.tokens)) {
		| Some value => value
		| None => 0n
	};

	let new_value = value + p.value;
	let new_tokens = Big_map.update (p.address_to, (Some (new_value)), s.tokens);
	
	(([]: list (operation)), { ...s, tokens:new_tokens });
};

let getAllowance = ((p,s) : (getAllowance, storage)) : (list (operation), storage) => {
	let value = switch (Big_map.find_opt ((p.owner, p.spender), s.allowances)) {
	|	Some value => value
	|	None => 0n
	};
	let op = Tezos.transaction (value, 0mutez, p.callback);
	([op],s)
};

let getBalance = ((p,s) : (getBalance, storage)) : (list (operation), storage) => {
	let value = switch (Big_map.find_opt (p.owner, s.tokens)) {
	|	Some value => value
	|	None => 0n
	};
	let op = Tezos.transaction (value, 0mutez, p.callback);
	([op],s)
};

let getTotalSupply = ((p,s) : (getTotalSupply, storage)) : (list (operation), storage) => {
  let total = s.total_amount;
  let op    = Tezos.transaction (total, 0mutez, p.callback);
  ([op],s)
};

// atomic swap

let lock = ((p,s) : (lock, storage)) : (list (operation), storage) => {
  // TODO
  // check status

  let swap_entry : swap = {
	  address_to 	: p.address_to,
	  address_from 	: Tezos.sender,
	  value 		: p.value,
	  releaseTime 	: p.releaseTime,
  };
  let new_swap = Big_map.add (p.lockId, swap_entry, s.swaps);
  
	let transfer : transfer = {
		address_to 		: Tezos.self_address,
		address_from 	: Tezos.sender,
		value 			: p.value
	};
  
 	let sender_balance = switch (Big_map.find_opt (Tezos.sender, s.tokens)) {
	|	Some value => value
	|	None       => 0n
	};

	if (sender_balance < transfer.value) { (failwith ("Not Enough Balance") : (list (operation), storage)); }
	else {
		let new_tokens = Big_map.update (transfer.address_from, (Some (abs(sender_balance - transfer.value))), s.tokens);
		let receiver_balance = switch (Big_map.find_opt (transfer.address_to, s.tokens)) {
		|	Some value => value
		|	None       => 0n
		};
		let new_tokens = Big_map.update (transfer.address_to, (Some (receiver_balance + transfer.value)), new_tokens);

		// TODO
		// update status
		
		(([]: list (operation)), { ...s, swaps: new_swap, tokens: new_tokens });
	};

	};


let revealSecretHash = ((p,s) : (revealSecretHash, storage)) : (list (operation), storage) => {
	// relevant when Alice receives token from Bob
	(([]: list (operation)), s);
};

let redeem = ((p,s) : (redeem, storage)) : (list (operation), storage) => {
	
	// check that p.secret is shorter than x
	// otherwise failwith ("TooLongSecret")

	// check that sha256 of p.secret == swap.secretHash
	// otherwise failwith ("InvalidSecret")	

	// check time
	// otherwise failwith ("SwapIsOver")

	let new_secrets = Big_map.add (p.lockId, p.secret, s.secrets);

	let swap = switch (Big_map.find_opt (p.lockId, s.swaps)) {
	| Some value => value
	| None 		 => (failwith ("SwapLockDoesNotExist") : swap)
	};

	let transfer : transfer = {
		address_to 		: swap.address_to,
		address_from 	: Tezos.self_address,
		value		    : swap.value
	};
  
 	let sender_balance = switch (Big_map.find_opt (transfer.address_from, s.tokens)) {
	|	Some value => value
	|	None       => 0n
	};
	// not performing check for enough balance, trusting that the smart contract is not sending around tokens
	let new_tokens = Big_map.update (transfer.address_from, (Some (abs(sender_balance - transfer.value))), s.tokens);
	let receiver_balance = switch (Big_map.find_opt (transfer.address_to, s.tokens)) {
	|	Some value => value
	|	None       => 0n
	};
	let new_tokens = Big_map.update (transfer.address_to, (Some (receiver_balance + transfer.value)), new_tokens);

	(([]: list (operation)), { ...s, tokens: new_tokens, secrets: new_secrets });
};


let main = ((a,s): (action, storage)) =>  
 	switch a {
   	|	Transfer p => transfer ((p,s))
	|	Approve  p => approve ((p,s))
	| 	Mint p => mint ((p,s))
	|	GetAllowance p => getAllowance ((p,s))
	|   GetBalance p => getBalance ((p,s))
	|	GetTotalSupply p => getTotalSupply ((p,s))
	|   Lock p => lock ((p,s))
	|	RevealSecretHash p => revealSecretHash ((p,s))
	|	Redeem p => redeem ((p,s))
	|	ClaimRefund p => (([]: list(operation)), s)
};
