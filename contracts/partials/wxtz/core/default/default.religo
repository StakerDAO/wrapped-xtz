let default = ((storage): (storage)): entrypointReturn => {
    let runParameter: runParameter = {
        lambdaName: "default",
        lambdaParameter: Bytes.pack(())
    };
    run((runParameter, storage));
};