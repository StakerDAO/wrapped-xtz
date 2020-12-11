const _coreHelpers = require('../helpers/core');
const coreInitialStorage = require('../../migrations/initialStorage/core');
const { alice, bob, carol, dave } = require('../../scripts/sandbox/accounts');
const _taquitoHelpers = require('../helpers/taquito');
const _tzip7Helpers = require('../helpers/tzip-7');
const tzip7InitialStorage = require('../../migrations/initialStorage/tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));;;
const { rpcErrors } = require('./../../helpers/constants');

contract('core', () => {
    
    describe('createOven', () => {
        let helpers = {};
        let accounts = {
            admin: alice,
            baker: bob,
            ovenOwner: carol,
            thirdParty: dave
        };

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(accounts.admin.sk);

            const { tzip7Address, tzip7Helpers } = await _tzip7Helpers.originate(tzip7InitialStorage.base);
            const { coreAddress, coreHelpers } = await _coreHelpers.originate(
                coreInitialStorage.base(tzip7Address)
            );
            helpers = { tzip7Helpers, coreHelpers, coreAddress };

            await helpers.tzip7Helpers.setAdministrator(coreAddress);
        });

        it('should create an oven and send a deposit to it', async () => {
            // create oven with inital balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
            const delegate = alice.pkh;
            const { ovenHelpers, ovenAddress } = await helpers.coreHelpers.createOven(
                accounts.baker.pkh, // delegate
                accounts.ovenOwner.pkh,
                {
                    amount: amountMutez
                }
            );
            const actualOwner = await helpers.coreHelpers.getOvenOwner(ovenAddress);
            expect(actualOwner).to.equal(accounts.ovenOwner.pkh);

            const actualDelegate = await ovenHelpers.getDelegate();
            expect(actualDelegate).to.equal(accounts.baker.pkh);

            expect(await ovenHelpers.getCoreAddress()).to.equal(helpers.coreAddress);

            const wXTZbalanceAlice = await helpers.tzip7Helpers.getBalance(accounts.ovenOwner.pkh);
            expect(wXTZbalanceAlice).to.equal(amountMutez);

            // send an additional deposit to the oven
            await ovenHelpers.default(amountMutez);
            const wXTZbalanceAliceFinal = await helpers.tzip7Helpers.getBalance(accounts.ovenOwner.pkh);
            expect(wXTZbalanceAliceFinal).to.equal(amountMutez + amountMutez);
        });

        it('should create an oven for oven by a 3rd party', async () => {           
            // create oven with initial balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
            
            await _taquitoHelpers.setSigner(accounts.thirdParty.sk);
            const { ovenHelpers, ovenAddress } = await helpers.coreHelpers.createOven(
                accounts.baker.pkh,
                accounts.ovenOwner.pkh,
                {
                    amount: amountMutez
                }
            );
            // owner is Alice, not Bob!
            const actualOwner = await helpers.coreHelpers.getOvenOwner(ovenAddress);
            expect(actualOwner).to.equal(accounts.ovenOwner.pkh);

            const actualDelegate = await ovenHelpers.getDelegate();
            expect(actualDelegate).to.equal(accounts.baker.pkh)

            expect(await ovenHelpers.getCoreAddress()).to.equal(helpers.coreAddress);

            const wXTZBalanceOvenOwner = await helpers.tzip7Helpers.getBalance(accounts.ovenOwner.pkh);
            expect(wXTZBalanceOvenOwner).to.equal(amountMutez);
        });

        it('should create an oven without a delegate', async () => {
            // create oven with inital balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
        
            const { ovenHelpers, ovenAddress } = await helpers.coreHelpers.createOven(
                null, // delegate, becomes None: option(key_hash) in coreHelper.createOven
                accounts.ovenOwner.pkh,
                {
                    amount: amountMutez
                }
            );
        
            const actualOwner = await helpers.coreHelpers.getOvenOwner(ovenAddress);
            expect(actualOwner).to.equal(accounts.ovenOwner.pkh);
            
            // RPC gives 404 error if no delegate is set
            await expect(ovenHelpers.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);

            expect(await ovenHelpers.getCoreAddress()).to.equal(helpers.coreAddress);

            const wXTZBalanceOvenOwner = await helpers.tzip7Helpers.getBalance(accounts.ovenOwner.pkh);
            expect(wXTZBalanceOvenOwner).to.equal(amountMutez);
        });

        it('should create an oven by a 3rd party and XTZ deposited by a baker', async () => {
            // create oven with inital balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
            
            await _taquitoHelpers.setSigner(accounts.thirdParty.sk);
            const { ovenHelpers, ovenAddress } = await helpers.coreHelpers.createOven(
                accounts.baker.pkh,
                accounts.ovenOwner.pkh,
                {
                    amount: amountMutez
                }
            );
            // owner is Alice, not Bob!
            const actualOwner = await helpers.coreHelpers.getOvenOwner(ovenAddress);
            expect(actualOwner).to.equal(accounts.ovenOwner.pkh);

            const actualDelegate = await ovenHelpers.getDelegate();
            expect(actualDelegate).to.equal(accounts.baker.pkh)

            expect(await ovenHelpers.getCoreAddress()).to.equal(helpers.coreAddress);

            const wXTZBalanceOvenOwner = await helpers.tzip7Helpers.getBalance(accounts.ovenOwner.pkh);
            expect(wXTZBalanceOvenOwner).to.equal(amountMutez);

            await _taquitoHelpers.setSigner(accounts.baker.sk);
            // send an additional deposit to the oven
            await ovenHelpers.default(amountMutez);
            const wXTZBalanceOvenOwnerAfterDeposit = await helpers.tzip7Helpers.getBalance(accounts.ovenOwner.pkh);
            expect(wXTZBalanceOvenOwnerAfterDeposit).to.equal(amountMutez + amountMutez);
        });
    });
});
