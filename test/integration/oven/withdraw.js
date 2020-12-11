const { alice, carol, chuck, walter } = require('../../../scripts/sandbox/accounts');
const _taquitoHelpers = require('../../helpers/taquito');
const _managerHelpers = require('../../helpers/manager');
const { expect } = require('chai').use(require('chai-as-promised'));
const { contractErrors, rpcErrors } = require('./../../../helpers/constants');
const { TezosOperationError } = require("@taquito/taquito");
const before = require('./../before');

contract('core, oven, TZIP-7', () => {
    describe('withdraw with an implicit account', () => {
        let helpers = {};
        let balance = {};
        const ovenOwner = alice;
        const thirdParty = chuck; // has malicious intent
        const amountTez = 1000;
        const amountMutez = amountTez * 1000000;

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
            balance.xtzOvenBefore = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
        });

        it('should not allow withdrawals by 3rd parties', async () => {
            // switching to a malicious participant
            await _taquitoHelpers.setSigner(thirdParty.sk);
            
            await expect(helpers.oven.withdraw(balance.wXtzOvenOwnerBefore)).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.notAnOvenOwner);
        });

        it('should not allow withdrawals above available xtz balance in oven', async () => { 
            const amountAboveBalance = balance.xtzOvenBefore + 1;
            
            // it fails in the core, before it can hit any TZIP-7 error
            await expect(helpers.oven.withdraw(amountAboveBalance)).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', '(temporary) ' + rpcErrors.michelson.balanceTooLow);
        });

        it('should not allow withdrawals above available wXtz balance for oven owner', async () => { 
            const amountAboveBalance = balance.wXtzOvenOwnerBefore + 1;
            
            // it fails in the core, before it can hit any TZIP-7 error
            await expect(helpers.oven.withdraw(amountAboveBalance)).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', '(temporary) ' + rpcErrors.michelson.balanceTooLow);
        });

        it('should allow to withdraw if enough wXTZ to burn is available', async () => {
            // withdraw total oven balance
            const totalOvenBalance = balance.xtzOvenBefore;
            const operation = await helpers.oven.withdraw(totalOvenBalance);
            
            // check wXTZ balance in TZIP-7
            balance.wXtzOvenOwnerAfter = await helpers.tzip7.getBalance(ovenOwner.pkh);                
            expect(balance.wXtzOvenOwnerAfter).to.be.equal(balance.wXtzOvenOwnerBefore - totalOvenBalance);
            
            // check XTZ balance of Alice
            balance.xtzOvenOwnerAfter = await _taquitoHelpers.getXTZBalance(ovenOwner.pkh);
            expect(balance.xtzOvenOwnerAfter).to.equal(balance.xtzOvenOwnerBefore + balance.xtzOvenBefore - operation.params.fee);

            // check XTZ balance of oven
            balance.xtzOvenAfter = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
            expect(balance.xtzOvenAfter).to.equal(0);
        });

        it('should fail to withdraw if not enough wXTZ is available (than XTZ in the oven)', async () => {
            const totalOvenBalance = balance.xtzOvenBefore;
            // oven owner reduces wXTZ
            const someAliceWxtz = balance.wXtzOvenOwnerBefore / 2;
            await helpers.tzip7.transfer(someAliceWxtz, ovenOwner.pkh, carol.pkh);
            
            // Alice attempts to withdraw all XTZ in the oven, but does not have enough wXTZ
            const operationPromise = helpers.oven.withdraw(totalOvenBalance);

            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.notEnoughBalance);
        });   
    });

    describe('withdraw with an originated account', () => {
        let helpers = {};
        let balance = {};
        let ovenOwner = {}; // assigning manager contract
        const amountTez = 1000;
        const amountMutez = amountTez * 1000000;

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);
            
            let { managerHelpers, managerAddress } = await _managerHelpers.originate();
            ovenOwner.pkh = managerAddress;
            helpers.manager = managerHelpers;
            
            await before(
                managerAddress, // owner
                amountMutez, 
                helpers
            );
            
            balance.wXtzOvenOwnerBefore = await helpers.tzip7.getBalance(ovenOwner.pkh);
            balance.xtzOvenOwnerBefore = await _taquitoHelpers.getXTZBalance(ovenOwner.pkh);
            balance.xtzOvenBefore = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
        });

        it('should not allow withdrawals above available XTZ balance in oven', async () => { 
            // XTZ requested > XTZ in oven
            const amountAboveBalance = balance.xtzOvenBefore + 1;
            
            // it fails before it can hit TZIP-7 error
            await expect(helpers.manager.withdraw(amountAboveBalance, helpers.oven.instance.address)).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', '(temporary) ' + rpcErrors.michelson.balanceTooLow);
        });

        it('should not allow withdrawals above available wXTZ balance and not enough XTZ in oven', async () => { 
            // XTZ_requested > XTZ in oven & XTZ_r > wXTZ
            const amountAboveBalance = balance.wXtzOvenOwnerBefore + 1;
            
            // it fails before it can hit TZIP-7 error
            await expect(helpers.manager.withdraw(amountAboveBalance, helpers.oven.instance.address)).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', '(temporary) ' + rpcErrors.michelson.balanceTooLow);
        });

        it('should allow withdrawals if enough wXTZ to burn is available', async () => {
            // XTZ_requested <= XTZ in oven & XTZ_r <= wXTZ
            const totalOvenBalance = balance.xtzOvenBefore;
            // withdraw total oven balance
            await helpers.manager.withdraw(totalOvenBalance, helpers.oven.instance.address);
            
            // check wXTZ balance in TZIP-7
            balance.wXtzOvenOwnerAfter = await helpers.tzip7.getBalance(ovenOwner.pkh);                
            expect(balance.wXtzOvenOwnerAfter).to.be.equal(balance.wXtzOvenOwnerBefore - totalOvenBalance);
            
            // check XTZ balance of oven owner manager contract
            // here the fee is 0, because it is paid by the sender of the operation (alice.sk)
            balance.xtzOvenOwnerAfter = await _taquitoHelpers.getXTZBalance(ovenOwner.pkh);
            expect(balance.xtzOvenOwnerAfter).to.equal(balance.xtzOvenOwnerBefore + balance.xtzOvenBefore);

            // check XTZ balance of oven
            balance.xtzOvenAfter = await _taquitoHelpers.getXTZBalance(helpers.oven.instance.address);
            expect(balance.xtzOvenAfter).to.equal(0);
        });

        it('should not allow withdrawals above available wXTZ balance, but enough XTZ in oven', async () => {
            // XTZ_requested <= XTZ in oven & XTZ_r > wXTZ
            const totalOvenBalance = balance.xtzOvenBefore;
            // oven owner sends half of wXTZ to Carol
            const someAliceWxtz = await helpers.tzip7.getBalance(ovenOwner.pkh) / 2;

            await helpers.manager.transfer(ovenOwner.pkh, carol.pkh, someAliceWxtz, helpers.tzip7.instance.address)

            // withdraw total oven balance
            const operationPromise = helpers.manager.withdraw(totalOvenBalance, helpers.oven.instance.address);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.notEnoughBalance);
        });

        // TODO: multiple ovens and withdrawing XTZ_oven1 = XTZ_requested < wXTZ_total_owned 
    });

    describe('withdraw to a not suitable originated account', () => {
        let helpers = {};
        let ovenOwner = {}; // manager contract
        const amountTez = 1000;
        const amountMutez = amountTez * 1000000;

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);
            
            const brokenManger = true;
            let { managerHelpers, managerAddress } = await _managerHelpers.originate(brokenManger);
            ovenOwner.pkh = managerAddress;
            helpers.manager = managerHelpers;

            await before(
                ovenOwner.pkh, // oven owner
                amountMutez, // initial balance
                helpers
            );
        });

        it('should fail to withdraw to a smart contract without a %default entrypoint', async () => {
            const operationPromise = helpers.manager.withdraw(amountMutez, helpers.oven.instance.address);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.core.ovenOwnerDoesNotAcceptDeposits); 
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
                1000000000, // initial balance
                helpers
            );
            
            // stop all token operations, by pause guardian Walter
            await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                await helpers.tzip7.setPause(true);
            });
        });
        
        it('should not allow withdrawals', async () => {
            const operationPromise = helpers.oven.withdraw(500000000, helpers.oven.instance.address);
        
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
        });
    });
});