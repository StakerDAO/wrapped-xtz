const core = artifacts.require('core');
const tzip7 = artifacts.require('tzip-7');
const coreHelpersFactory = require('../helpers/core');
const tzip7HelpersFactory = require('../helpers/tzip-7');
const { Tezos } = require('@taquito/taquito');
const { InMemorySigner } = require('@taquito/signer');
const { alice, bob } = require('./../../scripts/sandbox/accounts');
const { expect } = require('chai').use(require('chai-as-promised'));;

const err = {
    core: {
        notAnOvenOwner: 13,
    },
    proto: {
        balanceTooLow: "proto.006-PsCARTHA.contract.balance_too_low"
    },
    tzip7: {
        tokenOperationsPaused: "TokenOperationsArePaused"
    }
};

contract('Core', () => {
    describe('Oven tests', () => {
        
        let coreInstance;
        let tzip7Instance;
        let coreHelpers;
        let tzip7Helpers;
        let ovenInstance;
        let rpc;
        const ovenOwner = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
        const ovenDelegate = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";

        before(async () => {
            coreInstance = await core.deployed();
            tzip7Instance = await tzip7.deployed();
            
            coreHelpers = coreHelpersFactory(coreInstance);
            tzip7Helpers = tzip7HelpersFactory(tzip7Instance);

            // read host from TruffleContract
            rpc = tzip7Instance.constructor.currentProvider.host;
            // setup Taquito
            Tezos.setProvider({
                rpc: rpc, 
                signer: await InMemorySigner.fromSecretKey(alice.sk)
            });

            // set tzip-7 admin to be the core address
            await tzip7Instance.setAdministrator(coreInstance.address);
        });

        it('should deploy an oven for testing purposes', async () => {
            const createOvenResult = await coreHelpers.createOven(ovenDelegate, ovenOwner, {
                amount: 1000
            });
            ovenInstance = await Tezos.contract.at(createOvenResult.ovenAddress);
        });

        it('should accept deposits and mint wXTZ 1:1 with XTZ deposited', async () => {
            const xtzAmount = 1000;
            const balanceBeforeAlice = await tzip7Helpers.getBalance(alice.pkh);
            await (await Tezos.contract.transfer({
                to: ovenInstance.address,
                amount: xtzAmount
            })).confirmation(1);
            const balanceAfterAlice = await tzip7Helpers.getBalance(alice.pkh);
            // compare wXTZ balance plus XTZ amount
            expect(balanceBeforeAlice.plus(xtzAmount).toNumber()).to.be.equal(balanceAfterAlice.toNumber())
        });

        it('should not allow withdrawals for 3rd parties', async () => {
            // switching to Bob's secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
            await expect(ovenInstance.methods.withdraw(1000).send()).to.be.rejectedWith(err.notAnOvenOwner);
        });

        it('should not allow withdrawals above available balance', async () => {
            // switching to Alice' secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(alice.sk)});
            
            const XTZBalanceAlice = await Tezos.tz.getBalance(alice.pkh);
            const amountMoreThanBalance = XTZBalanceAlice + 1;
            await expect(
                    ovenInstance.methods
                    .withdraw(amountMoreThanBalance)
                    .send()
                ).to.be.rejectedWith(err.proto.balanceTooLow);
        });

        it('should allow withdrawals if enough wXTZ to burn is available', async () => {
            // switching to Alice' secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(alice.sk)});
            const XTZBalanceBeforeAlice = await Tezos.tz.getBalance(alice.pkh);
            const wXTZBalanceBeforeAlice = await tzip7Helpers.getBalance(alice.pkh);

            const withdrawOperation = await ovenInstance.methods.withdraw(wXTZBalanceBeforeAlice).send();
            await (withdrawOperation).confirmation(1);

            const wXTZBalanceAfterAlice = await tzip7Helpers.getBalance(alice.pkh);
            const XTZBalanceAfterAlice = await Tezos.tz.getBalance(alice.pkh);

            expect(wXTZBalanceAfterAlice.toNumber()).to.be.equal(0);
            // TODO: check XTZ balance but include fees as well
        });

        describe('Token operations paused', () => {
            before(async () => {
                // stop all token operations, by pause guardian Alice
                await tzip7Instance.setPause(true)
            });

            it('should not allow to withdraw', async () => {
                // switching to Alice' secret key
                Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(alice.sk)});

                await expect(ovenInstance.methods.withdraw(1).send()).to.be.rejectedWith(err.tzip7.tokenOperationsPaused);
            });

            it('should not allow to deposit', async () => {
                // switching to Bob's secret key
                Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
                await expect(Tezos.contract.transfer({
                    to: ovenInstance.address,
                    amount: 100
                })).to.be.rejectedWith(err.tzip7.tokenOperationsPaused);
            });
        });
    });
})