/**
 * (pair %getAllowance (pair (address :owner) (address :spender))
 *                                    (contract nat)))
 */
type getAllowanceParameter = {
    owner: address,
    spender: address,
    callback: contract(nat),
};

type getAllowanceParameterMichelson = michelson_pair_left_comb(getAllowanceParameter);
let toGetAllowanceParameter = (getAllowanceParameterMichelson: getAllowanceParameterMichelson): getAllowanceParameter => {
    Layout.convert_from_left_comb(getAllowanceParameterMichelson)
}
