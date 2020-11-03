#include "../../errors.religo"
#include "../../storage/storage.religo"
#include "../../arbitraryValues/getArbitraryValue.religo"

let getWXTZTokenContractAddress = ((storage): (storage)): address => {
    // obtain the wXTZ token contract address
    // TODO: extract the arbitrary value key into a variable
    let wXTZTokenContractAddress: bytes = getArbitraryValue(("wXTZTokenContractAddress", storage));
    let wXTZTokenContractAddress: option(address) = Bytes.unpack(wXTZTokenContractAddress);
    
    switch (wXTZTokenContractAddress) {
        | Some(wXTZTokenContractAddress) => wXTZTokenContractAddress
        | None => (failwith(errorArbitraryValueWrongType): address)
    };
}