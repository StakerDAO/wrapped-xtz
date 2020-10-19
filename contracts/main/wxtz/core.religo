#include "../../partials/wxtz/core/types.religo"
#include "../../partials/wxtz/core/parameter/parameter.religo"
#include "../../partials/wxtz/core/storage/storage.religo"
#include "../../partials/wxtz/core/errors.religo"

#include "../../partials/wxtz/core/runEntrypointLambda/runEntrypointLambda.religo"
#include "../../partials/wxtz/core/default/default.religo"

/**
 * wXTZ Core
 */
let main = ((mainParameter, storage): (mainParameter, storage)): (list(operation), storage) => {
    // TODO: create a 'wrapper/main' lambda that wraps all the other lambda invocations
    switch (mainParameter) {
        /**
         * Default entrypoint
         */
        | Default => default((storage))
        /**
         * Run entrypoint is used to run lambdas stored in the storage.
         * Those lambdas must conform to the entrypoint type signature.
         */
        | RunEntrypointLambda(runEntrypointLambdaParameter) => runEntrypointLambda((runEntrypointLambdaParameter, storage))
    };
};
