let lambda = ((lambdaParameter, storage): (lambdaParameter, storage)): entrypointReturn => {
    let updateLambdasParameter: option(updateLambdasParameter) = Bytes.unpack(lambdaParameter);
    let updateLambdasParameter = switch (updateLambdasParameter) {
        | None => (failwith(errorLambdaParameterWrongType): updateLambdasParameter);
        | Some(updateLambdasParameter) => updateLambdasParameter
    };

    ([]: list(operation), storage)
}