let default = ((storage): (storage)): entrypointReturn => {
    let runEntrypointLambdaParameter: runEntrypointLambdaParameter = {
        lambdaName: "default",
        lambdaParameter: Bytes.pack(())
    };
    runEntrypointLambda((runEntrypointLambdaParameter, storage));
};