const core = artifacts.require('core');
const { Tezos } = require('@taquito/taquito');
const testPackValue = require('../../scripts/lambdaCompiler/testPackValue');
const _ovenHelpers = require('./oven');

const coreHelpers = (instance) => {
    return {
        createOven: async (delegateKeyHash, ownerAddress, sendParams) => {
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
            ).send({
                mutez: true,
                ...sendParams
            });

            await operation.confirmation(1);
    
            const ovenAddress = operation.receipt.results[0].metadata.internal_operation_results[0].result.originated_contracts[0]
            console.log('Originated oven at', ovenAddress);

            return {
                operation,
                ovenAddress,
                ovenHelpers: await _ovenHelpers.at(ovenAddress)
            };
        }
    };
}
module.exports = {
    originate: async function(initialStorage) {
        const instance = await core.new(initialStorage);
        console.log('Originated core at', instance.address);
        const coreHelpers = await this.at(instance.address);
        return { 
            instance,
            coreHelpers,
            coreAddress: instance.address
        };
    },
    at: async function(address) {
        const instance = await Tezos.contract.at(address);
        return coreHelpers(instance);
    } 
}