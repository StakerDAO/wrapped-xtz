const compileLambdaParameter = require('./testPackValue');
const expression = process.argv.splice(2)[0];
console.log(compileLambdaParameter(expression));