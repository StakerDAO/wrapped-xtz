const { alice, bob, carol, walter } = require('../../../scripts/sandbox/accounts');
const _taquitoHelpers = require('../../helpers/taquito');
const { expect } = require('chai').use(require('chai-as-promised'));
const { TezosOperationError } = require("@taquito/taquito");
const { contractErrors } = require('./../../../helpers/constants');
const before = require('./../before');

contract('core, oven, TZIP-7', () => {
    const amountTez = 1000;
    const amountMutez = amountTez * 1000000;

    describe('oven', () => {
        let helpers = {};
        const ovenOwner = alice;
        const baker = bob;
        const thirdParty = carol;
    
        describe('default (deposit XTZ)', () => {
            let balance = {};

            beforeEach(async () => {
                await _taquitoHelpers.initialize();
                await _taquitoHelpers.setSigner(ovenOwner.sk);
                
                await before(
                    ovenOwner.pkh, // oven owner
                    amountMutez, // initial balance
                    helpers
                );
        
                balance.wXtzOvenOwnerBefore = await helpers.tzip7.getBalance(ovenOwner.pkh);
                balance.xtzOvenOwnerBefore = await _taquitoHelpers.getXTZBalance(ovenOwner.pkh);
                balance.xtzThirdPartyBefore = await _taquitoHelpers.getXTZBalance(thirdParty.pkh);
                balance.xtzOvenBefore = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
                balance.xtzBakerBefore = await _taquitoHelpers.getXTZBalance(baker.pkh);
            });

            it('should deposit XTZ by oven owner Alice and mint 1:1 wXTZ', async () => {
                // deposit XTZ
                const operation = await helpers.oven.default(amountMutez);

                // wXTZ was minted and increased for oven owner
                balance.wXtzOvenOwnerAfter = await helpers.tzip7.getBalance(ovenOwner.pkh);
                expect(balance.wXtzOvenOwnerAfter).to.equal(balance.wXtzOvenOwnerBefore + amountMutez);

                // xtz increased in oven
                balance.xtzOvenAfter = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
                expect(balance.xtzOvenAfter).to.equal(balance.xtzOvenBefore + amountMutez);

                // xtz decreased for oven owner
                balance.xtzOvenOwnerAfter = await _taquitoHelpers.getXTZBalance(ovenOwner.pkh);
                expect(balance.xtzOvenOwnerAfter).to.equal(balance.xtzOvenOwnerBefore - amountMutez - operation.params.fee);
            });

            it('should deposit XTZ by a baker and mint 1:1 wXTZ', async () => {
                await _taquitoHelpers.setSigner(baker.sk);
                // deposit XTZ
                const operation = await helpers.oven.default(amountMutez);

                // wXTZ was minted and increased for oven owner
                balance.wXtzOvenOwnerAfter = await helpers.tzip7.getBalance(ovenOwner.pkh);
                expect(balance.wXtzOvenOwnerAfter).to.equal(balance.wXtzOvenOwnerBefore + amountMutez);

                // xtz increased in oven
                balance.xtzOvenAfter = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
                expect(balance.xtzOvenAfter).to.equal(balance.xtzOvenBefore + amountMutez);

                // xtz decreased for baker
                balance.xtzBakerAfter = await _taquitoHelpers.getXTZBalance(baker.pkh);
                expect(balance.xtzBakerAfter).to.equal(balance.xtzBakerBefore - amountMutez - operation.params.fee)
            });

            it('should deposit XTZ by a 3rd party and mint 1:1 wXTZ', async () => {
                await _taquitoHelpers.setSigner(thirdParty.sk);
                // deposit XTZ
                const operation = await helpers.oven.default(amountMutez);

                // wXTZ was minted and increased for oven owner
                balance.wXtzOvenOwnerAfter = await helpers.tzip7.getBalance(ovenOwner.pkh);
                expect(balance.wXtzOvenOwnerAfter).to.equal(balance.wXtzOvenOwnerBefore + amountMutez);

                // xtz increased in oven
                balance.xtzOvenAfter = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
                expect(balance.xtzOvenAfter).to.equal(balance.xtzOvenBefore + amountMutez);

                // xtz decreased for third party
                balance.xtzThirdPartyAfter = await _taquitoHelpers.getXTZBalance(thirdParty.pkh);
                expect(balance.xtzThirdPartyAfter).to.equal(balance.xtzThirdPartyBefore - amountMutez - operation.params.fee)
            });
        });
    });

    describe.skip('token operations are paused in TZIP-7', () => {
        let helpers = {};
        const ovenOwner = alice;
        const pauseGuardian = walter;

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(ovenOwner.sk);
        
            await before(
                ovenOwner.pkh, // oven owner
                amountMutez, // initial balance
                helpers
            );
            
            // stop all token operations, by pause guardian
            await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                await helpers.tzip7.setPause(true);
            });
        });
        
        // TODO find a way to catch the error that goes over 3 smart contract hops (taquito specific)
        it('should not allow deposits', async () => {
            const operationPromise = helpers.oven.default(1);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
        });
    });
});