#include "parameter.religo"


let lock = ((p,s) : (lock, storage)) : (list (operation), storage) => {
  // TODO
  // check status
  
  let status : string = switch (p.secretHash) {
	  | Some hashlock => hash_revealed
	  | None => initialized
  };
  let new_status = Big_map.update (p.lockId, Some(status), s.status);

  let swap_entry : swap = {
	  address_to 	: p.address_to,
	  address_from 	: Tezos.sender,
	  value 		: p.value,
	  releaseTime 	: p.releaseTime,
  };
  let new_swap = Big_map.add (p.lockId, swap_entry, s.bridge.swaps);
  
	let transfer : transfer = {
		address_to 		: Tezos.self_address,
		address_from 	: Tezos.sender,
		value 			: p.value
	};
  
 	let sender_balance = switch (Big_map.find_opt (Tezos.sender, s.token.ledger)) {
	|	Some value => value
	|	None       => 0n
	};

	if (sender_balance < transfer.value) { (failwith ("Not Enough Balance") : (list (operation), storage)); }
	else {
		let new_tokens = Big_map.update (transfer.address_from, (Some (abs(sender_balance - transfer.value))), s.token.ledger);
		let receiver_balance = switch (Big_map.find_opt (transfer.address_to, s.token.ledger)) {
		|	Some value => value
		|	None       => 0n
		};
		let new_tokens = Big_map.update (transfer.address_to, (Some (receiver_balance + transfer.value)), new_tokens);

	
		if (status == hash_revealed) {
			let new_hashlock = Big_map.update (p.lockId, p.secretHash, s.hashlock);
			(([]: list (operation)), { ...s, bridge: { ...s.bridge, swaps: new_swap }, token : {...s.token, ledger: new_tokens }, status: new_status, hashlock: new_hashlock});
		} else{
			(([]: list (operation)), { ...s, bridge: { ...s.bridge, swaps: new_swap }, token : {...s.token, ledger: new_tokens }, status: new_status });
		}

	};

};