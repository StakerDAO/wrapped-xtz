const core = artifacts.require('core');
const compileLambdaParameter = require('../../scripts/lambdaCompiler/testCompileLambdaParameter');
const { Tezos } = require('@taquito/taquito');
const { InMemorySigner } = require('@taquito/signer');
const { alice } = require('../../scripts/sandbox/accounts');

contract('', () => {
    describe('Oven creation with the first baker payout', () => {

        let instance;
        let storage;
        let ovenAddress;
        before(async () => {
            instance = await core.deployed();
            storage = await instance.storage();
        });

        it('should create an oven with Alice as an owner', async () => {
            const createOvenOperation = await instance.runEntrypointLambda(
                'createOven', // lambdaName
                compileLambdaParameter(`
                    {
                        delegate: (None: option(key_hash)),
                        ovenOwner: ("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb": address) 
                    }
                `).bytes.replace('0x','') // TODO: extract the 0x bytes replacement
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