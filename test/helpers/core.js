const core = artifacts.require('core');
const { Tezos } = require('@taquito/taquito');
const testPackValue = require('../../scripts/lambdaCompiler/testPackValue');
const _ovenHelpers = require('./oven');

const coreHelpers = (instance) => {
    return {
        instance: instance,
        runEntrypointLambda: async function(lambdaName, lambdaParameter, sendParams) {
            const operation = await instance.methods.runEntrypointLambda(
                lambdaName,
                testPackValue(lambdaParameter),
            ).send({
                mutez: true,
                ...sendParams
            });
            await operation.confirmation(1);
            return operation;
        },
        getArbitraryValue: async function(key) {
            return await (await instance.storage()).arbitraryValues.get(key);
        },
        createOven: async function(delegateKeyHash, ownerAddress, sendParams) {
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
            const ovenAddress = operation.results[0].metadata.internal_operation_results[0].result.originated_contracts[0]
            console.log('Originated oven at', ovenAddress);

            return {
                operation,
                ovenAddress,
                ovenHelpers: await _ovenHelpers.at(ovenAddress)
            };
        },
        getOvenOwner: async (ovenAddress) => {
            return await (await instance.storage()).ovens.get(ovenAddress);
        },
        default: async (sendParams) => {
            const operation = await Tezos.contract.transfer({
                to: instance.address,
                amount: sendParams.amount,
                mutez: true
            });
            await operation.confirmation(1);
            return operation;
        },
        onOvenWithdrawalRequested: async function(amount, sender, sendParams) {
            const operation = await instance.methods.runEntrypointLambda(
                'onOvenWithdrawalRequested', //lambdaName
                testPackValue(`
                    {
                        sender: ("${sender}": address),
                        value: ${amount}
                    }
                `)
            ).send({
                mutez: true,
                ...sendParams
            });

            await operation.confirmation(1);
            return operation
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