const core = artifacts.require('core');
const tzip7 = artifacts.require('tzip-7');
const coreHelpersFactory = require('../helpers/core');
const tzip7HelpersFactory = require('../helpers/tzip-7');
const { Tezos } = require('@taquito/taquito');
const { InMemorySigner } = require('@taquito/signer');
const { alice } = require('./../../scripts/sandbox/accounts');
const { expect } = require('chai');

contract('Core', () => {
    describe.only('Oven', () => {
        
        let coreInstance;
        let tzip7Instance;
        let coreHelpers;
        let tzip7Helpers;
        let ovenInstance;
        const ovenOwner = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
        const ovenDelegate = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";

        before(async () => {
            coreInstance = await core.deployed();
            tzip7Instance = await tzip7.deployed();
            
            coreHelpers = coreHelpersFactory(coreInstance);
            tzip7Helpers = tzip7HelpersFactory(tzip7Instance);

            // setup taquito
            const rpc = "http://localhost:8732"
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
            const balanceBeforeAlice = await tzip7Helpers.getBalance(alice.pkh);
            await (await Tezos.contract.transfer({
                to: ovenInstance.address,
                amount: 1000
            })).confirmation(1);
            const balanceAfterAlice = await tzip7Helpers.getBalance(alice.pkh);
            expect(balanceBeforeAlice.plus(1000).toNumber()).to.be.equal(balanceAfterAlice.toNumber())
        });

        it('should allow withdrawals if enough wXTZ to burn is available', async () => {
            const XTZBalanceBeforeAlice = await Tezos.tz.getBalance(alice.pkh);
            const wXTZBalanceBeforeAlice = await tzip7Helpers.getBalance(alice.pkh);

            const withdrawOperation = await ovenInstance.methods.withdraw(wXTZBalanceBeforeAlice).send();
            await (withdrawOperation).confirmation(1);

            const wXTZBalanceAfterAlice = await tzip7Helpers.getBalance(alice.pkh);
            const XTZBalanceAfterAlice = await Tezos.tz.getBalance(alice.pkh);

            expect(wXTZBalanceAfterAlice.toNumber()).to.be.equal(0);
            // TODO: check XTZ balance but include fees as well
        });

    });
})