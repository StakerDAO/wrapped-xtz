
const _cryptoHelpers = require('../../../helpers/crypto');
const _tzip7InitialStorage = require('./../../../migrations/initialStorage/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const getViews = artifacts.require('getViews');
const accounts = require('./accounts');
const getDelayedISOTime = require('../../../helpers/getDelayedISOTime');
const { expect } = require('chai').use(require('chai-as-promised'));
const before = require('./before');

contract('TZIP-7 with bridge', () => {
    let helpers = {};
    let swapSecret;
    let swapLockParameters = {
        confirmed: true,
        fee: 10,
        releaseTime: getDelayedISOTime(1), 
        secretHash: undefined,
        to: accounts.recipient.pkh,
        value: 5000
    };

    describe('Invoke %getSwap on bridge by a smart contract', () => {

        beforeEach(async () => {
            await before(
                _tzip7InitialStorage.withApprovals,
                accounts,
                helpers
            );
            // locking swap through contract call is leaner than migrating
            await _taquitoHelpers.setSigner(accounts.sender.sk);
            swapSecret = _cryptoHelpers.randomSecret();
            swapLockParameters.secretHash = _cryptoHelpers.hash(swapSecret);
            await helpers.tzip7.lock(swapLockParameters);

            getViewsInstance = await getViews.deployed();
            // display the get view contract address for debugging purposes
            console.log('Get View contract deployed at:', getViewsInstance.address);
        });
        
        it('should return the swap lock to the view contract', async () => {
            // invoke %getSwap on bridge through view contract
            await getViewsInstance.requestSwap(helpers.tzip7.instance.address, swapLockParameters.secretHash);

            // read callback swap that was saved into storage
            const storageGetViewsInstance = await getViewsInstance.storage()
            const swapFromContract = storageGetViewsInstance.swap;
            // transform numbers for assertion
            swapFromContract.fee = swapFromContract.fee.toNumber();
            swapFromContract.value = swapFromContract.value.toNumber();
            // swap entry matches lock parameters
            let swapRecord = swapLockParameters;
            swapRecord.from = accounts.sender.pkh; // add this for assertion
            delete swapRecord.secretHash; // remove this for assertion
            expect(swapFromContract).to.include(swapRecord);
        });
    });
});