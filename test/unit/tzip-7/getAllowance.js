const tzip7 = artifacts.require('tzip-7');
const getViews = artifacts.require('getViews');
const { expect } = require('chai').use(require('chai-as-promised'));

const { alice, bob, carol } = require('../../../scripts/sandbox/accounts');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');

contract('TZIP-7 token contract %getAllowance entrypoint', () => {
    let helpers = {};
    const admin = alice;
    let getViewsInstance;
    
    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.getAllowance);
        // deploy a smart contract to perform views
        getViewsInstance = await getViews.deployed();
        // display the contract addresses for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);
        console.log('Originated get views contract at:', getViewsInstance.address);
        
        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(admin.sk);

        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
    });

    describe("Get Contract Views", () => {

        it("should call %getAllowance of TZIP-7 to receive approved allowance", async () => {
            const owner = bob.pkh;
            const spender = carol.pkh;      
            await getViewsInstance.requestAllowance(helpers.tzip7.instance.address, owner, spender);

            const getViewsInstanceStorage = await getViewsInstance.storage();
            const allowanceFromContractView = Number(getViewsInstanceStorage.allowance);
            const allowanceFromTzip7 = await helpers.tzip7.getAllowance(owner, spender);
            expect(allowanceFromContractView).to.equal(allowanceFromTzip7);
        });
    });
});
