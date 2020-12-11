const { execSync } = require('child_process');

module.exports = (expression) => {
    const output = execSync(
        `${__dirname}/test-pack-value.sh '${expression}'`,
        {
            encoding: 'utf8'
        }
    )

    return JSON.parse(output).bytes.replace('0x','');
}
