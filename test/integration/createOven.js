const core = artifacts.require('core');
const tzip7 = artifacts.require('tzip-7'); 
const testPackValue = require('../../scripts/lambdaCompiler/testPackValue');
const { Tezos } = require('@taquito/taquito');
const { InMemorySigner } = require('@taquito/signer');
const { alice } = require('../../scripts/sandbox/accounts');

contract('', () => {
    describe.only('Oven creation with the first baker payout', () => {

        let instance;
        let storage;
        let ovenAddress;
        let tzip7Instance;

        before(async () => {
            instance = await core.deployed();
            tzip7Instance = await tzip7.deployed();
            storage = await instance.storage();

            console.log('setting the administrator')
            // set tzip-7 admin to be the core address
            await tzip7Instance.setAdministrator(instance.address);
            console.log('administrator set');
        });

        it('should create an oven with Alice as an owner', async () => {
            const createOvenOperation = await instance.runEntrypointLambda(
                'createOven', // lambdaName
                testPackValue(`
                    {
                        delegate: (None: option(key_hash)),
                        ovenOwner: ("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb": address) 
                    }
                `)
            );
            ovenAddress = createOvenOperation.receipt.results[0].metadata.internal_operation_results[0].result.originated_contracts[0];
            
            console.log('core address', instance.address);
            console.log('oven address', ovenAddress);
        });

        it('should send a rewards payout from a baker to the oven', async () => {
            const rpc = "http://localhost:8732"
            Tezos.setProvider({
                rpc: rpc, 
                signer: await InMemorySigner.fromSecretKey(alice.sk)
            });
            const transferOperation = await Tezos.contract.transfer({
                to: ovenAddress,
                amount: 1000
            })
            await transferOperation.confirmation(1);
        });
    });
});