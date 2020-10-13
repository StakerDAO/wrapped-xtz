const compileLambdaParameter = require('./testCompileLambdaParameter');
const expression = process.argv.splice(2)[0];
console.log(compileLambdaParameter(expression));