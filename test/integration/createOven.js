const core = artifacts.require('core');
const tzip7 = artifacts.require('tzip-7'); 
const testPackValue = require('../../scripts/lambdaCompiler/testPackValue');
const { Tezos } = require('@taquito/taquito');
const { InMemorySigner } = require('@taquito/signer');
const { alice, bob } = require('../../scripts/sandbox/accounts');
const coreHelpersFactory = require('../helpers/core');
const tzip7HelpersFactory = require('../helpers/tzip-7');
const { expect } = require('chai');
const { readFileSync } = require('fs');

contract('Core', () => {

    const ovenOwner = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
    const ovenDelegate = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
    const ovenCode = readFileSync(`${process.cwd()}/contracts/partials/wxtz/core/lambdas/createOven/oven/oven.tz`, {
        encoding: 'utf8'
    });

    describe('createOven', () => {
        let coreInstance;
        let ovenAddress;
        let tzip7Instance;
        let coreHelpers;
        let tzip7Helpers;
        let rpc;

        before(async () => {
            coreInstance = await core.deployed();
            tzip7Instance = await tzip7.deployed();
            coreHelpers = coreHelpersFactory(coreInstance);
            tzip7Helpers = tzip7HelpersFactory(tzip7Instance);

            // set tzip-7 admin to be the core address
            const setAdmin = await tzip7Instance.setAdministrator(coreInstance.address);
            
            // read host from TruffleContract
            rpc = tzip7Instance.constructor.currentProvider.host;
            // setup Taquito
            Tezos.setProvider({
                rpc: rpc, 
                signer: await InMemorySigner.fromSecretKey(alice.sk)
            });

            // display smart contract address
            console.log("Core address", coreInstance.address);
            console.log("TZIP-7 address", tzip7Instance.address);
        });

        it('should create an oven with Alice as an owner and mint 1000 wXTZ', async () => {
            const aliceBalanceBefore = await tzip7Helpers.getBalance(alice.pkh);
            const createOvenResult = await coreHelpers.createOven(ovenDelegate, ovenOwner, {
                amount: 1000
            });
            
            ovenAddress = createOvenResult.ovenAddress;
            console.log("Oven address", ovenAddress);
            let aliceBalanceAfter = await tzip7Helpers.getBalance(alice.pkh);
            
            expect(aliceBalanceBefore.plus(1000).toNumber()).to.be.equal(aliceBalanceAfter.toNumber());
            expect(await coreHelpers.getOvenOwner(ovenAddress)).to.be.equal(ovenOwner);
        });

        it('should not create an oven for someone other than admin', async () => {
            // switching to Bob's secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
            const contract = await Tezos.contract.at(coreInstance.address);
            await contract.methods.runEntrypointLambda(
                'createOven', // lambdaName
                testPackValue(`
                    {
                        delegate: None: option(key_hash),
                        ovenOwner: ("${bob.pkh}": address) 
                    }
                `)
            ).send();
            const createOvenResult = await coreHelpers.createOven(ovenDelegate, ovenOwner, {
                amount: 1000
            });
            
            ovenAddress = createOvenResult.ovenAddress;
            console.log("Oven address", ovenAddress);
        });
        
        it('should be delegated to the predefined delegate', async () => {
            // watch out, throws 404 when the delegate is not set
            const existingOvenDelegate = await Tezos.rpc.getDelegate(ovenAddress);
            expect(existingOvenDelegate).to.be.equal(ovenDelegate)
        });

        // TODO: it's harder to check if the deployed script is the same as the compiled oven
        // since it's wrapped in an additional lambda
        // it.only('should have deployed an oven with the appropriate oven code', async () => {
        //     const { code } = await Tezos.rpc.getScript(ovenAddress);
        //     expect(code[2].args).to.be.equal(ovenCode);
        // });
    });
});