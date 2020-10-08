#include "../../partials/wxtz/core/types.religo"
#include "../../partials/wxtz/core/parameter/parameter.religo"
#include "../../partials/wxtz/core/storage/storage.religo"
#include "../../partials/wxtz/core/errors.religo"

#include "../../partials/wxtz/core/run/run.religo"
#include "../../partials/wxtz/core/default/default.religo"

/**
 * wXTZ Core
 */
let main = ((parameter, storage): (parameter, storage)): (list(operation), storage) => {
    switch (parameter) {
        /**
         * Default entrypoint
         */
        | Default => default((storage))
        /**
         * Run entrypoint is used to run lambdas stored in the storage.
         * Those lambdas must confront to the entrypoint type signature.
         */
        // TODO: create a 'run' lambda that wraps all the other lamba invocations
        | Run(runParameter) => run((runParameter, storage))
    };
};