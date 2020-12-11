let setTokenAllowance = ((owner, spender, value, approvals): (address, address, nat, approvals)): approvals => {
    Big_map.update(
        (owner, spender),
        Some(value),
        approvals
    );
};