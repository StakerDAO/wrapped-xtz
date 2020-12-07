const _taquitoHelpers = require('../../helpers/taquito');
const _tzip7Helpers = require('../../helpers/tzip-7');
const tzip7 = artifacts.require('tzip-7');

module.exports = async (initialStorage, accounts, helpers) => {
    tzip7Instance = await tzip7.new(initialStorage);
    // display the current contract address for debugging purposes
    console.log('Originated token contract at:', tzip7Instance.address);
    // initialize helpers
    await _taquitoHelpers.initialize();
    helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
    
    helpers.balances = {};
    helpers.balances.senderBefore = await helpers.tzip7.getBalance(accounts.sender.pkh);
    helpers.balances.recipientBefore = await helpers.tzip7.getBalance(accounts.recipient.pkh);
    helpers.balances.lockSaverBefore = await helpers.tzip7.getBalance(accounts.lockSaver.pkh);
    helpers.balances.totalSupplyBefore = initialStorage.token.totalSupply;
    return helpers;
};
