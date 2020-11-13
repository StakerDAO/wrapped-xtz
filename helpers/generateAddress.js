let oldContract;
if (typeof contract !== 'undefined') oldContract = contract;

const eztz = require('eztz.js').eztz;
function generateAddress() {
    let mnemonic = eztz.crypto.generateMnemonic(); // generate mnemonic phrase
    let password = Math.random().toString(36).substring(2, 15); // generate password
    let wallet = eztz.crypto.generateKeys(mnemonic, password); // create wallet by password and mnemonic
    return wallet.pkh;
};

// eztz has a global contract variable that conflicts with Truffle's testing contract
if (oldContract) contract = oldContract;
module.exports = generateAddress