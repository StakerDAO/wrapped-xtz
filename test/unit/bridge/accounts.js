const { alice, bob, carol, walter, chuck } = require('./../../../scripts/sandbox/accounts');

module.exports = {
    admin: alice,
    sender: bob,
    recipient: carol,
    thirdParty: chuck, // has malicious intent
    pauseGuardian: walter
};