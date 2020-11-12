const testPackValue = require('../../scripts/lambdaCompiler/testPackValue');
const { Tezos } = require('@taquito/taquito');
const core = artifacts.require('core');

module.exports = (instance) => ({
    createOven: async (delegateKeyHash, ownerAddress, extras) => {
        let delegate;
        if (delegateKeyHash === null) {
            delegate = 'None: option(key_hash)';
        } else {
            delegate = `Some("${delegateKeyHash}": key_hash): option(key_hash)`;
        }
        const operation = await instance.runEntrypointLambda(
            'createOven', // lambdaName
            testPackValue(`
                {
                    delegate: ${delegate},
                    ovenOwner: ("${ownerAddress}": address) 
                }
            `),
            extras
        );

        const ovenAddress = operation.receipt.results[0].metadata.internal_operation_results[0].result.originated_contracts[0]

        return {
            operation,
            ovenAddress
        };
    },
    getOvenOwner: async (ovenAddress) => {
        let storage = await instance.storage();
        return await storage.ovens.get(ovenAddress);
    },
    default: async (amount) => {
        return await instance.transfer({ amount });
    }
})