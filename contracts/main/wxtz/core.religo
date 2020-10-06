#include "../../partials/wxtz/core/types.religo"
#include "../../partials/wxtz/core/parameter/parameter.religo"
#include "../../partials/wxtz/core/storage/storage.religo"
#include "../../partials/wxtz/core/errors.religo"

#include "../../partials/wxtz/core/run/run.religo"

let main = ((parameter, storage): (parameter, storage)): (list(operation), storage) => {
    switch (parameter) {
        // optionally run a default lambda
        | Default => ([]: list(operation), storage);
        | Run(runParameter) => run((runParameter, storage))
    };
};