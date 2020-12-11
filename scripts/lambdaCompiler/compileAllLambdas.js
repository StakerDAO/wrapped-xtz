const lambdas = require('./../../lambdas');
const compileLambdaAsArtifact = require('./compileLambdaAsArtifact');

lambdas.forEach(lambda => {
    console.log('Compiling', lambda.lambdaName);
    compileLambdaAsArtifact(lambda.lambdaName, lambda.selectFromJSONOutput, lambda.saveToFile);
});
