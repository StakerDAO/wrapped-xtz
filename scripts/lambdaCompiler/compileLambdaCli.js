const compileLambda = require('./compileLambda');
const lambdaPath = process.argv[2];
const selectFromJSONOutput = process.argv[3];
const saveToFile = process.argv[4];

const output = compileLambda(lambdaPath, selectFromJSONOutput, saveToFile);

if (!saveToFile) console.log(output);

console.log('Lambda compilation successful');
