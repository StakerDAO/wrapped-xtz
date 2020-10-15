/**
 * wXTZ Oven contract storage
 */
type ovenStorage = {
    // Used to determine who can withdraw locked XTZ
    ownerAddress: address,
    // Used to notify wXTZ Core of operations on the wXTZ Oven
    coreAddress: address
};