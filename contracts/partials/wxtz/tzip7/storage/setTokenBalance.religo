let setTokenBalance = ((owner, value, ledger): (address, nat, ledger)): ledger => {
    Big_map.update(
        owner,
        Some(value),
        ledger
    );
};