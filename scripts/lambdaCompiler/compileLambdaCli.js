const compileLambda = require('./compileLambda');
const lambdaPath = process.argv.splice(2)[0];
console.log(compileLambda(lambdaPath));