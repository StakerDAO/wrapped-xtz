const { execSync } = require('child_process');

module.exports = (expression) => {
    const output = execSync(
        `${__dirname}/compile-contract.sh '${expression}'`,
        {
            encoding: 'utf8'
        }
    )

    return JSON.parse(output);
}
