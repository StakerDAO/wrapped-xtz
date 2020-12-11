let mint = ((mintParameter, tokenStorage): (mintParameter, tokenStorage)): (entrypointReturn, tokenStorage) => {
	// continue only if token operations are not paused
	failIfPaused(tokenStorage);
	// only the admin is allowed to mint tokens
    failIfNotAdmin(tokenStorage);

	let tokenStorage = updateTokenStorageByMint(
		mintParameter,
		tokenStorage
	);
	// no operations are returned, only the updated token storage
	(emptyListOfOperations, tokenStorage);
};