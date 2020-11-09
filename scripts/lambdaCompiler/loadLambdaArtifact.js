const compileLambdaAsArtifact = require('./compileLambdaAsArtifact')
const { readJsonSync, pathExistsSync } = require('fs-extra')
module.exports = (lambdaPath, recompile, selectFromJSONOutput) => {
    let artifactPath = `./build/lambdas/${lambdaPath}`; // TODO: extract lambda artifact path
    // attempt to recompile if artifact is not found, for better dev experience
    let artifactFound = pathExistsSync(artifactPath);
    if (recompile || !artifactFound) { 
        compileLambdaAsArtifact(lambdaPath, selectFromJSONOutput);
    }
    return readJsonSync(artifactPath);
}   