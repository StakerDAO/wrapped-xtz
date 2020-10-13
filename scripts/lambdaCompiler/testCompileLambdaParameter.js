const { execSync } = require('child_process');

module.exports = (expression) => {
    const output = execSync(
        `./scripts/lambdaCompiler/test-compile-lambda-parameter.sh '${expression}'`,
        {
            encoding: 'utf8'
        }
    )

    return JSON.parse(output);
}