const compileLambda = require('./compileLambda');

module.exports = (lambdaPath, selectFromJSONOutput, saveToFile) => {
    let artifactPath = `${__dirname}/../../build/lambdas/${lambdaPath}`; // TODO: extract lambda artifact path
    if (saveToFile) artifactPath = saveToFile;
    return compileLambda(lambdaPath, selectFromJSONOutput, artifactPath);
};
