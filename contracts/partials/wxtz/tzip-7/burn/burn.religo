let burn = ((burnParameter, tokenStorage): (burnParameter, tokenStorage)): tokenEntrypointReturn => {
    // continue only if token operations are not paused
    failIfPaused(tokenStorage);
    // only the admin is allowed to burn tokens
    failIfNotAdmin(tokenStorage);

    let tokenStorage = updateTokenStorageByBurn(
        burnParameter,
        tokenStorage
    );
    // no operations are returned, only the updated storage
    (emptyListOfOperations, tokenStorage);
};
