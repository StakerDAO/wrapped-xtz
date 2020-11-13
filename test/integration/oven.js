const _coreHelpers = require('../helpers/core');
const coreInitialStorage = require('../../migrations/initialStorage/core');
const { alice, bob, carline, stella, tabbie, mallory } = require('../../scripts/sandbox/accounts');
const _taquitoHelpers = require('../helpers/taquito');
const _tzip7Helpers = require('../helpers/tzip-7');
const tzip7InitialStorage = require('../../migrations/initialStorage/tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));;;
const { contractErrors, rpcErrors } = require('./../../helpers/constants');
const { Tezos } = require('@taquito/taquito');

contract('core', () => {
    describe('oven', () => {
        let helpers = {};

        beforeEach(async () => {
            await _taquitoHelpers.initialize();
            await _taquitoHelpers.setSigner(alice.sk);

            const { tzip7Address, tzip7Helpers } = await _tzip7Helpers.originate(tzip7InitialStorage.base);
            const { coreAddress, coreHelpers } = await _coreHelpers.originate(
                coreInitialStorage.base(tzip7Address)
            );
            
            await tzip7Helpers.setAdministrator(coreAddress);

            // create oven with inital balance
            const amountTez = 1000;
            const amountMutez = amountTez * 1000000;
            const owner = alice.pkh;
            const delegate = alice.pkh;
            const { ovenHelpers, ovenAddress } = await coreHelpers.createOven(
                delegate,
                owner,
                {
                    amount: amountMutez
                }
            );
            helpers = { tzip7Helpers, coreHelpers, ovenHelpers, ovenAddress };
        });

        describe('default (deposit XTZ)', () => {
            it('should deposit XTZ and mint 1:1 wXTZ', async () => {
                const owner = await helpers.coreHelpers.getOvenOwner(helpers.ovenAddress);
                const amountTez = 1000;
                const amountMutez = amountTez * 1000000;
                const wXTZbalanceBefore = await helpers.tzip7Helpers.getBalance(owner);
                const XTZBalanceBefore = await _taquitoHelpers.getXTZBalance(helpers.ovenAddress);

                // deposit XTZ
                await helpers.ovenHelpers.default(amountMutez);

                const wXTZbalanceAfter = await helpers.tzip7Helpers.getBalance(owner);
                expect(wXTZbalanceAfter).to.equal(wXTZbalanceBefore + amountMutez);

                const XTZBalanceAfter = await _taquitoHelpers.getXTZBalance(helpers.ovenAddress);
                expect(XTZBalanceAfter).to.equal(XTZBalanceBefore + amountMutez);
            });

            it('should deposit XTZ by a 3rd party', async () => {
                const owner = await helpers.coreHelpers.getOvenOwner(helpers.ovenAddress);
                const amountTez = 1000;
                const amountMutez = amountTez * 1000000;
                const wXTZbalanceBefore = await helpers.tzip7Helpers.getBalance(owner);
                const XTZBalanceBefore = await _taquitoHelpers.getXTZBalance(helpers.ovenAddress);

                // deposit XTZ
                await _taquitoHelpers.signAs(stella.sk, async () => {
                    await helpers.ovenHelpers.default(amountMutez);
                });           

                const wXTZbalanceAfter = await helpers.tzip7Helpers.getBalance(owner);
                expect(wXTZbalanceAfter).to.equal(wXTZbalanceBefore + amountMutez);

                const XTZBalanceAfter = await _taquitoHelpers.getXTZBalance(helpers.ovenAddress);
                expect(XTZBalanceAfter).to.equal(XTZBalanceBefore + amountMutez);
            });
        });
        
        describe('withdraw', () => {
        
            it('should not allow withdrawals by 3rd parties', async () => {
                // switching to Carline's secret key
                await _taquitoHelpers.setSigner(carline.sk);
                await expect(helpers.ovenHelpers.withdraw(1000)).to.be.rejectedWith(contractErrors.core.notAnOvenOwner);
            });
    
            it('should not allow withdrawals above available balance', async () => { 
                const wXTZBalanceAlice = await helpers.tzip7Helpers.getBalance(alice.pkh);
                const amountAboveBalance = wXTZBalanceAlice + 1;
                
                // it fails before it can hit TZIP-7 error
                await expect(helpers.ovenHelpers.withdraw(amountAboveBalance))
                        .to.be.rejectedWith(rpcErrors.michelson.balanceTooLow);
            });
    
            it('should allow withdrawals if enough wXTZ to burn is available', async () => {
                const XTZBalanceAliceMutezBefore = await _taquitoHelpers.getXTZBalance(alice.pkh);
                const wXTZBalanceBeforeAlice = await helpers.tzip7Helpers.getBalance(alice.pkh);
                const XTZBalanceOvenMutezBefore = await _taquitoHelpers.getXTZBalance(helpers.ovenAddress);
                // withdraw total oven balance
                await helpers.ovenHelpers.withdraw(XTZBalanceOvenMutezBefore);
                
                // check wXTZ balance in TZIP-7
                const wXTZBalanceAfterAlice = await helpers.tzip7Helpers.getBalance(alice.pkh);                
                expect(wXTZBalanceAfterAlice).to.be.equal(wXTZBalanceBeforeAlice.minus(XTZBalanceOvenMutezBefore));
                
                // check XTZ balance of Alice
                const XTZBalanceAliceMutezAfter = await _taquitoHelpers.getXTZBalance(alice.pkh);
                expect(XTZBalanceAliceMutezAfter).to.equal(XTZBalanceAliceMutezBefore.plus(XTZBalanceOvenMutezBefore));

                // check XTZ balance of oven
                const XTZBalanceOvenMutezAfter = await _taquitoHelpers.getXTZBalance(helpers.ovenAddress);
                expect(XTZBalanceOvenMutezAfter).to.equal(0);

                // TODO: check XTZ balance but include fees as well
            });

            it('should not allow a withdrawal request when the contract invocation carries XTZ', async () => {
                const ovenInstance = await Tezos.contract.at(helpers.ovenAddress);
                await expect(ovenInstance.methods.withdraw(100).send({ amount: 10 })).to.be.rejectedWith(contractErrors.core.amountNotZero);
            });

            it.skip('should fail when withdrawing to a smart contract that does not support %default entrypoint', async () => {
                // TODO
            });

            it.skip('should withdraw to a smart contract', async () => {

            });
            
        });

        describe('setDelegate', () => {
            it("should delegate to Bob's address", async () => {
                const newDelegate = bob.pkh;
                // read current delegate
                const previousBakerDelegate = await helpers.ovenHelpers.getDelegate();
                // set Bob as new delegate for oven contract
                await helpers.ovenHelpers.setDelegate(newDelegate);
                
                const newBakerDelegate = await helpers.ovenHelpers.getDelegate();
                expect(newBakerDelegate).not.to.equal(previousBakerDelegate);
                expect(newBakerDelegate).to.equal(newDelegate);
            });

            it('should remove delegate', async () => {
                // remove delegation
                await helpers.ovenHelpers.setDelegate(null);
                // throws 404 error code if no delegate is set
                await expect(helpers.ovenHelpers.getDelegate()).to.be.rejectedWith(rpcErrors.notFound);
            });

            it('should not allow a 3rd party to change the delegation', async () => {
                // switch to malicious actor's secret key
                await _taquitoHelpers.setSigner(mallory.sk);
                const newDelegate = bob.pkh;
                await expect(helpers.ovenHelpers.setDelegate(newDelegate)).to.be.rejectedWith(contractErrors.core.notAnOvenOwner);
            });
        });

        describe('token operations are paused', () => {
            it('should not allow withdrawals', async () => {
                // stop all token operations, by pause guardian Alice
                await helpers.tzip7Helpers.setPause(true);
                await expect(helpers.ovenHelpers.withdraw(1)).to.be.rejectedWith(contractErrors.tzip7.tokenOperationsPaused);
            });

            it('should not allow deposits', async () => {
                // stop all token operations, by pause guardian Alice
                await helpers.tzip7Helpers.setPause(true);
                await expect(helpers.ovenHelpers.default(1)).to.be.rejectedWith(contractErrors.tzip7.tokenOperationsPaused);
            });

        });

        //TODO call oven by core contract

    });
});