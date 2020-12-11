#include "../runEntrypointLambda/parameter.religo"
type defaultParameter = unit;

type mainParameter = 
| Default(defaultParameter)
| RunEntrypointLambda(runEntrypointLambdaParameter)
