const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
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
            encoding: 'utf8'
        }
    );
    let returnValue;
    if (selectFromJSONOutput) {
        returnValue = get(JSON.parse(output), selectFromJSONOutput);   
    } else {
        returnValue = JSON.parse(output);
    }

    if (saveToFile) {
        writeFileSync(
            saveToFile,
            returnValue
        );
    }

    return returnValue;
};