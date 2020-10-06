#include "../run/parameter.religo"
type defaultParameter = unit;

type parameter = 
| Default(defaultParameter)
| Run(runParameter)