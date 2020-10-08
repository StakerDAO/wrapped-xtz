const { execSync } = require('child_process');

module.exports = (lambdaPath) => {
    // mock contract a.k.a. init path
    const mockContractPath = (() => {
        const paths = lambdaPath.split('/');
        const lambdaFileName = paths[paths.length - 1].split('.');
        paths.pop();
        return paths.join('/') + `/${lambdaFileName.join('Init.')}`; 
    })();
    const output = execSync(
        `./scripts/lambdaCompiler/compile-lambda.sh ${mockContractPath} ${lambdaPath}`,
        {
            encoding: 'utf8'
        }
    );
    return JSON.parse(output);
};