const _coreHelpers = require('../helpers/core');
const coreInitialStorage = require('../../migrations/initialStorage/core');
const { alice, bob, carline, stella, tabbie } = require('../../scripts/sandbox/accounts');
const _taquitoHelpers = require('../helpers/taquito');
const _tzip7Helpers = require('../helpers/tzip-7');
const tzip7InitialStorage = require('../../migrations/initialStorage/tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));;;
const { rpcErrors } = require('./../../helpers/constants');

const ovenCode = readFileSync(`${process.cwd()}/contracts/partials/wxtz/core/lambdas/createOven/oven/oven.tz`, {
    encoding: 'utf8'
});

contract('core', () => {
    
    describe('createOven', () => {
        let helpers = {};

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            const { tzip7Address, tzip7Helpers } = await _tzip7Helpers.originate(tzip7InitialStorage.base);
            const { coreAddress, coreHelpers } = await _coreHelpers.originate(
                coreInitialStorage.base(tzip7Address)
            );
            helpers = { tzip7Helpers, coreHelpers };

            await helpers.tzip7Helpers.setAdministrator(coreAddress);
        });

        it('should create an oven and send a deposit to it', async () => {
            // create oven with inital balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
            const owner = alice.pkh;
            const delegate = alice.pkh;
            const { ovenHelpers, ovenAddress } = await helpers.coreHelpers.createOven(
                delegate,
                owner,
                {
                    amount: amountMutez
                }
            );
            const actualOwner = await helpers.coreHelpers.getOvenOwner(ovenAddress);
            expect(actualOwner).to.equal(owner);

            const actualDelegate = await ovenHelpers.getDelegate();
            expect(actualDelegate).to.equal(delegate);

            expect(await ovenHelpers.getCoreAddress()).to.equal(helpers.coreAddress);

            const wXTZbalanceAlice = await helpers.tzip7Helpers.getBalance(owner);
            expect(wXTZbalanceAlice).to.equal(amountMutez);

            // send an additional deposit to the oven
            await ovenHelpers.default(amountMutez);
            const wXTZbalanceAliceFinal = await helpers.tzip7Helpers.getBalance(owner);
            expect(wXTZbalanceAliceFinal).to.equal(amountMutez + amountMutez);
        });

        it('should create an oven for Alice by a 3rd party Bob', async () => {           
            // create oven with initial balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
            const owner = alice.pkh;
            const delegate = alice.pkh;
            
            await _taquitoHelpers.setSigner(bob.sk);
            const { ovenHelpers, ovenAddress } = await helpers.coreHelpers.createOven(
                delegate,
                owner,
                {
                    amount: amountMutez
                }
            );
            // owner is Alice, not Bob!
            const actualOwner = await helpers.coreHelpers.getOvenOwner(ovenAddress);
            expect(actualOwner).to.equal(owner);

            const actualDelegate = await ovenHelpers.getDelegate();
            expect(actualDelegate).to.equal(delegate)

            expect(await ovenHelpers.getCoreAddress()).to.equal(helpers.coreAddress);

            const wXTZbalanceAlice = await helpers.tzip7Helpers.getBalance(owner);
            expect(wXTZbalanceAlice).to.equal(amountMutez);
        });

        it('should create an oven for Alice without delegate', async () => {
            // create oven with inital balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
            const owner = alice.pkh;
        
            const { ovenHelpers, ovenAddress } = await helpers.coreHelpers.createOven(
                null, // delegate, becomes None: option(key_hash) in coreHelper.createOven
                owner,
                {
                    amount: amountMutez
                }
            );
        
            const actualOwner = await helpers.coreHelpers.getOvenOwner(ovenAddress);
            expect(actualOwner).to.equal(owner);
            
            // RPC gives 404 error if no delegate is set
            await expect(ovenHelpers.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);

            expect(await ovenHelpers.getCoreAddress()).to.equal(helpers.coreAddress);

            const wXTZbalanceAlice = await helpers.tzip7Helpers.getBalance(owner);
            expect(wXTZbalanceAlice).to.equal(amountMutez);
        });

        it('should create an oven by a 3rd party and be topped up by a 3rd party', async () => {
            // create oven with inital balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
            const owner = carline.pkh;
            const delegate = tabbie.pkh;
            
            await _taquitoHelpers.setSigner(stella.sk);
            const { ovenHelpers, ovenAddress } = await helpers.coreHelpers.createOven(
                delegate,
                owner,
                {
                    amount: amountMutez
                }
            );
            // owner is Alice, not Bob!
            const actualOwner = await helpers.coreHelpers.getOvenOwner(ovenAddress);
            expect(actualOwner).to.equal(owner);

            const actualDelegate = await ovenHelpers.getDelegate();
            expect(actualDelegate).to.equal(delegate)

            expect(await ovenHelpers.getCoreAddress()).to.equal(helpers.coreAddress);

            const wXTZbalanceAlice = await helpers.tzip7Helpers.getBalance(owner);
            expect(wXTZbalanceAlice).to.equal(amountMutez);

            await _taquitoHelpers.setSigner(trent.sk);
            // send an additional deposit to the oven
            await ovenHelpers.default(amountMutez);
            const wXTZbalanceAliceFinal = await helpers.tzip7Helpers.getBalance(owner);
            expect(wXTZbalanceAliceFinal).to.equal(amountMutez + amountMutez);
        });
    });
});