#include "../constants.religo"

let getTokenAllowance = ((owner, spender, approvals): (address, address, approvals)): nat => {
    let allowance = Big_map.find_opt(
        (owner, spender),
        approvals
    );
    switch (allowance) {
        | Some(allowance) => allowance
        | None => defaultAllowanceValue
    };
};
