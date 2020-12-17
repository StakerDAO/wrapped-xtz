
const _cryptoHelpers = require('../../../helpers/crypto');
const _tzip7InitialStorage = require('./../../../migrations/initialStorage/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const getViews = artifacts.require('getViews');
const accounts = require('./accounts');
const { expect } = require('chai').use(require('chai-as-promised'));
const before = require('./before');

contract('TZIP-7 with bridge', () => {
    let helpers = {};
    let swapSecret;
    let secretHash;

    describe('Invoke %getOutcome on bridge by a smart contract', () => {

        beforeEach(async () => {
            swapSecret = _cryptoHelpers.randomSecret();
            secretHash = _cryptoHelpers.hash(swapSecret);
            await before(
                _tzip7InitialStorage.test.getOutcome(secretHash, swapSecret),
                accounts,
                helpers
            );

            getViewsInstance = await getViews.deployed();
            // display the get view contract address for debugging purposes
            console.log('Get View contract deployed at:', getViewsInstance.address);
        });
        
        it('should return the swap lock to the view contract', async () => {
            // for testing pruposes any key can be used to interact with get views contract
            await _taquitoHelpers.setSigner(accounts.admin.sk)
            // invoke %getOutcome on bridge through view contract
            await getViewsInstance.requestOutcome(helpers.tzip7.instance.address, secretHash);

            // read callback swap that was saved into storage
            const storageGetViewsInstance = await getViewsInstance.storage()
            const secretFromContract = storageGetViewsInstance.outcome;
            expect(secretFromContract).to.include(swapSecret);
        });
    });
});
