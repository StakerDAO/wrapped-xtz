#include "parameter.religo"

let revealSecretHash = ((p,s) : (revealSecretHash, storage)) : (list (operation), storage) => {
	// relevant when Alice receives token from Bob
	(([]: list (operation)), s);
};