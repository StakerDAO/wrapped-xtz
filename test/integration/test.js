const _coreHelpers = require('../helpers/core');
const coreInitialStorage = require('../../migrations/initialStorage/core');
const { InMemorySigner } = require('@taquito/signer');
const { alice } = require('../../scripts/sandbox/accounts');
const { Tezos } = require('@taquito/taquito');

contract('core', () => {
    describe('createOven', () => {

        let coreHelpers;

        beforeEach(async () => {
            // extract to misc helpers / config
            const rpc = "http://localhost:8732";
            const signer = (await InMemorySigner.fromSecretKey(alice.sk));

            Tezos.setProvider({
                rpc: rpc, 
                signer: signer
            });

            const coreInstance = await _coreHelpers.originate(coreInitialStorage.base);
            console.log('coreInstance', coreInstance.address);
            coreHelpers = await _coreHelpers.at(coreInstance.address);
        });

        it('should do something with the core', async () => {
            coreHelpers.createOven(
                "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
                "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
                {
                    amount: 1000 // set mutez mode to true first
                }
            )
        });

    });
});