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

            // display smart contract addresses
            console.log("Core address", coreInstance.address);
            console.log("TZIP-7 address", tzip7Instance.address);
        });

        it('should deploy an oven for testing purposes', async () => {
            const createOvenResult = await coreHelpers.createOven(ovenDelegate, ovenOwner, {
                amount: 1000
            });
            ovenInstance = await Tezos.contract.at(createOvenResult.ovenAddress);

            console.log("Oven address", ovenInstance.address);
        });

        describe('Deposit XTZ (%default entrypoint)', () => {
            it('should accept deposits and mint wXTZ 1:1 with XTZ deposited', async () => {
                const xtzAmount = 1000;
                const wXTZBalanceAliceBefore= await tzip7Helpers.getBalance(alice.pkh);
                await (await Tezos.contract.transfer({
                    to: ovenInstance.address,
                    amount: xtzAmount
                })).confirmation(1);
    
                const wXTZBalanceAliceAfter = await tzip7Helpers.getBalance(alice.pkh);
                // check for increased wXTZ balance
                expect(wXTZBalanceAliceBefore.plus(xtzAmount).toNumber()).to.be.equal(wXTZBalanceAliceAfter.toNumber())
            });
        });

        describe('Withdraw', () => {
            it('should not allow withdrawals for 3rd parties', async () => {
                // switching to Bob's secret key
                Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
                await expect(ovenInstance.methods.withdraw(1000).send()).to.be.rejectedWith(err.notAnOvenOwner);
            });
    
            it('should not allow withdrawals above available balance', async () => {
                // switching to Alice' secret key
                Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(alice.sk)});
                
                const wXTZBalanceAlice = await tzip7Helpers.getBalance(alice.pkh)
                const amountAboveBalance = wXTZBalanceAlice + 1;
            
                await expect(ovenInstance.methods.withdraw(amountAboveBalance).send())
                        .to.be.rejectedWith(err.proto.balanceTooLow);
            });
    
            it('should allow withdrawals if enough wXTZ to burn is available', async () => {
                // switching to Alice' secret key
                Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(alice.sk)});
                const XTZBalanceBeforeAlice = await Tezos.tz.getBalance(alice.pkh);
                const wXTZBalanceBeforeAlice = await tzip7Helpers.getBalance(alice.pkh);
                
                const withdrawOperation = await ovenInstance.methods.withdraw(2000).send().catch(err => console.log(err));
                await (withdrawOperation).confirmation(1);
                
                const wXTZBalanceAfterAlice = await tzip7Helpers.getBalance(alice.pkh);
                const XTZBalanceAfterAlice = await Tezos.tz.getBalance(alice.pkh);
    
                
                expect(wXTZBalanceAfterAlice.toNumber()).to.be.equal(30);
                // TODO: check XTZ balance but include fees as well
            });
        });

        describe('SetDelegate', () => {
            it("should delegate to Bob's address", async () => {
                // read current delegate
                const previousBakerDelegate = await Tezos.rpc.getDelegate(ovenInstance.address);
                
                // set Bob as new delegate for oven contract
                const setDelegateOperation = await ovenInstance.methods.setDelegate(bob.pkh).send();
                await setDelegateOperation.confirmation(1);
                
                const newBakerDelegate = await Tezos.rpc.getDelegate(ovenInstance.address);
                expect(newBakerDelegate).not.to.equal(previousBakerDelegate);
                expect(newBakerDelegate).to.equal(bob.pkh);
            });

            it("should remove delegate", async () => {
                // remove delegation to any address
                const setDelegateOperation = await ovenInstance.methods.setDelegate(null).send();
                await setDelegateOperation.confirmation(1);
                // throws 404 error code if no delegate is set
                await expect(Tezos.rpc.getDelegate(ovenInstance.address)).to.be.rejectedWith("(404)");
            });
        });

        describe('Token operations paused', () => {
            before(async () => {
                // need to fund oven
                const xtzAmount = 1000;
                await (await Tezos.contract.transfer({
                    to: ovenInstance.address,
                    amount: xtzAmount
                })).confirmation(1);
                
                // stop all token operations, by pause guardian Alice
                await tzip7Instance.setPause(true);
            });

            it('should not allow withdrawals', async () => {
                // switching to Alice' secret key
                Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(alice.sk)});
                
                await expect(ovenInstance.methods.withdraw(1).send()).to.be.rejectedWith("TokenOperationsArePaused");
            });

            it('should not allow deposits', async () => {
                // switching to Bob's secret key
                Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
                await expect(Tezos.contract.transfer({
                    to: ovenInstance.address,
                    amount: 100
                })).to.be.rejectedWith(err.tzip7.tokenOperationsPaused);
            });

            // after(async () => {
            //     // clean-up after tests, unpausing token operations
            //     await tzip7Instance.setPause(false);
            // });
        });
    });
})