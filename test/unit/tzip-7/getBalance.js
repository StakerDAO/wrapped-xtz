const tzip7 = artifacts.require('tzip-7');
const getViews = artifacts.require('getViews');
const { expect } = require('chai').use(require('chai-as-promised'));

const { alice, bob, carol } = require('../../../scripts/sandbox/accounts');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');

contract('TZIP-7 token contract %getBalance entrypoint', () => {
    let helpers = {};
    let getViewsInstance;
    
    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.withBalances);
        // deploy a smart contract to perform views
        getViewsInstance = await getViews.deployed();
        // display the contract addresses for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);
        console.log('Originated get views contract at:', getViewsInstance.address);
        
        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(alice.sk);

        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
    });

    describe("Get Contract Views", () => {

        it("should %getBalance of TZIP-7 for balance", async () => {
            await getViewsInstance.requestBalance(helpers.tzip7.instance.address, bob.pkh)
            
            let storageGetViewsInstance = await getViewsInstance.storage()
            let balanceFromViewContract = Number(storageGetViewsInstance.balance);
            let balanceFromTzip7 = await helpers.tzip7.getBalance(bob.pkh);
            expect(balanceFromViewContract).to.equal(balanceFromTzip7);
        });
    });
});