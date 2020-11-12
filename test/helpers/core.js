const core = artifacts.require('core');
const { Tezos } = require('@taquito/taquito');
const { InMemorySigner } = require('@taquito/signer');
const testPackValue = require('../../scripts/lambdaCompiler/testPackValue');
const { alice } = require('../../scripts/sandbox/accounts');

const coreHelpers = (instance) => {
    return {
        createOven: async (delegateKeyHash, ownerAddress, extras) => {
            let delegate;
            if (delegateKeyHash === null) {
                delegate = 'None: option(key_hash)';
            } else {
                delegate = `Some("${delegateKeyHash}": key_hash): option(key_hash)`;
            }
            const operation = await instance.methods.runEntrypointLambda(
                'createOven', // lambdaName
                testPackValue(`
                    {
                        delegate: ${delegate},
                        ovenOwner: ("${ownerAddress}": address) 
                    }
                `)
            ).send(extras);

            await operation.confirmation(1);
    
            const ovenAddress = operation.receipt.results[0].metadata.internal_operation_results[0].result.originated_contracts[0]
    
            return {
                operation,
                ovenAddress
            };
        }
    };
}
module.exports = {
    originate: async (initialStorage) => {
        return await core.new(initialStorage);
    },
    at: async (address) => {
        const instance = await Tezos.contract.at(address);
        return coreHelpers(instance);
    } 
}