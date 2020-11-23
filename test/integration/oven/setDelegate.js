const { alice, bob, carol, chuck } = require('../../../scripts/sandbox/accounts');
const _taquitoHelpers = require('../../helpers/taquito');
const _managerHelpers = require('../../helpers/manager');
const { expect } = require('chai').use(require('chai-as-promised'));
const { contractErrors, rpcErrors } = require('./../../../helpers/constants');
const { TezosOperationError } = require("@taquito/taquito");
const before = require('./../before');

contract('core, oven', () => {
    let helpers = {};
    let ovenOwner = alice;
    const baker = bob; // public key, not the hash of it is required
    const thirdParty = chuck; // has malicious intent

    describe('setDelegate with an implicit account', () => {
        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(ovenOwner.sk);
            
            helpers = await before(
                ovenOwner.pkh, //owner
                0,
                helpers
            );
        });

        it('should delegate to baker Bob', async () => {     
            // set new delegate        
            await expect(helpers.oven.setDelegate(baker.pkh)).to.be.fulfilled;
            // get new delegate
            const newDelegate = await helpers.oven.getDelegate();
            expect(newDelegate).to.equal(baker.pkh);
        });

        it('should remove delegate', async () => {
            // set new delegate
            await expect(helpers.oven.setDelegate(baker.pkh)).to.be.fulfilled;
            // remove delegation
            await helpers.oven.setDelegate(null);
            // throws 404 error code if no delegate is set
            await expect(helpers.oven.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);
        });

        it('should fail to set delegate by 3rd party', async () => {
            await _taquitoHelpers.setSigner(thirdParty.sk);
            
            const operationPromise = helpers.oven.setDelegate(thirdParty.pkh);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.notAnOvenOwner);
        });
    });

    describe('setDelegate with an originated account', () => {
        
        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(ovenOwner.sk);

            let { managerHelpers, managerAddress } = await _managerHelpers.originate();

            helpers = await before(
                managerAddress, // owner
                0, 
                helpers
            );
            
            helpers.manager = managerHelpers;
        });

        it('should delegate to baker Bob', async () => {     
            const ovenAddress = helpers.oven.instance.address;
            // set new delegate        
            await expect(helpers.manager.setDelegate(baker.pkh, ovenAddress)).to.be.fulfilled;
            // get new delegate
            const newDelegate = await helpers.oven.getDelegate();
            expect(newDelegate).to.equal(baker.pkh);
        });

        it('should remove delegate', async () => {
            const ovenAddress = helpers.oven.instance.address;
            // set new delegate
            await expect(helpers.manager.setDelegate(baker.pkh, ovenAddress)).to.be.fulfilled;
            // remove delegation
            await helpers.manager.setDelegate(null, ovenAddress);
            // throws 404 error code if no delegate is set
            await expect(helpers.oven.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);
        });
    });
});