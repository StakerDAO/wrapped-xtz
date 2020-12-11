const { execSync } = require('child_process');
const { outputFileSync } = require('fs-extra');
const { get } = require('lodash');

module.exports = (lambdaPath, selectFromJSONOutput, saveToFile) => {
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
            cwd: process.env.INIT_CWD,
            encoding: 'utf8',
        }
    );
    let returnValue;
    if (selectFromJSONOutput) {
        returnValue = get(JSON.parse(output), selectFromJSONOutput);   
    } else {
        returnValue = JSON.parse(output);
    }

    if (saveToFile) {
        outputFileSync(
            saveToFile,
            // stringify if micheline code is being saved
            (typeof returnValue === 'object' ? JSON.stringify(returnValue) : returnValue)
        );
    }

    return returnValue;
};
