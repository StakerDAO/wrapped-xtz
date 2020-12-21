const { alice, bob, carol, chuck, lock, walter } = require('./../../../scripts/sandbox/accounts');

module.exports = {
    admin: alice,
    sender: bob,
    recipient: carol,
    thirdParty: chuck, // has malicious intent
    pauseGuardian: walter, // warden
    lockSaver: lock,
};
