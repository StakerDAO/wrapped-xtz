/**
 * Function to find and return values in the arbitrary value storage
 */
let getArbitraryValue = ((arbitraryValueKey, storage): (arbitraryValueKey, storage)): arbitraryValue => {
    let arbitraryValue: option(arbitraryValue) = Big_map.find_opt(arbitraryValueKey, storage.arbitraryValues);
    let arbitraryValue = switch (arbitraryValue) {
        | Some(arbitraryValue) => arbitraryValue
        | None => (failwith(errorArbitraryValueKeyNotFound): arbitraryValue)
    };
    arbitraryValue;
};