/**
 * Function to update the arbitrary value storage
 */
let setArbitraryValue = ((arbitraryValueKey, arbitraryValue, storage): (arbitraryValueKey, option(arbitraryValue), storage)): storage => {
    let arbitraryValues = Big_map.update(arbitraryValueKey, arbitraryValue, storage.arbitraryValues);
    let storage = {
        ...storage,
        arbitraryValues: arbitraryValues
    };
    storage;
};
