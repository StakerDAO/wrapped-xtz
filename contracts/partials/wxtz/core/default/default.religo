/**
 * Entrypoint function that exists outside of `runEntrypointLambda`
 * in order to provide the fallback XTZ deposit entrypoint known as `%default`
 */
let default = ((storage): (storage)): entrypointReturn => {
    // Run the `default` lambda from wXTZ Core's storage
    let runEntrypointLambdaParameter: runEntrypointLambdaParameter = {
        lambdaName: "default",
        lambdaParameter: Bytes.pack(()) // TODO: type this as defaultParameter
    };
    runEntrypointLambda((runEntrypointLambdaParameter, storage));
};
