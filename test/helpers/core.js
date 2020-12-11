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
        setArbitraryValue: async function(key, value) {
            let packedArbitraryValue;
            if (value) {
                packedArbitraryValue = `Some("${testPackValue(value)}": bytes): option(bytes)`
            } else {
                packedArbitraryValue = `None: option(bytes)`
            }
            
            const operation = await this.runEntrypointLambda(
                'setArbitraryValue',
                `
                    {
                        arbitraryValueKey: "${key}",
                        arbitraryValue: ${packedArbitraryValue}
                    }
                `
            )
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
        onOvenDepositReceived: async (sendParams) => {
            const operation = await instance.methods.runEntrypointLambda(
                'onOvenDepositReceived',
                testPackValue('()')
            ).send(sendParams)
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
        },
        onOvenSetDelegate: async function(ovenOwnerAddress, sendParams) {
            const operation = await instance.methods.runEntrypointLambda(
                'onOvenSetDelegate', //lambdaName
                testPackValue(`
                    ("${ovenOwnerAddress}": address)
                `)
            ).send({
                mutez: true,
                ...sendParams
            });

            await operation.confirmation(1);
            return operation
        },
        updateLambdas: async function(lambdasList, sendParams) {
            let religoMapLiteral = [];
            lambdasList.forEach(lambda => {
                religoMapLiteral.push(`("${lambda.lambdaName}", Some("${lambda.bytes}": bytes))`);
            });
            const ligoExpression = religoMapLiteral.join(',');
            const operation = await instance.methods.runEntrypointLambda(
                'updateLambdas', //lambdaName
                testPackValue(`
                    Map.literal([${ligoExpression}])
                `)
            ).send({
                mutez: true,
                ...sendParams
            });

            return operation.confirmation(1);
        },
        getLambda: async function(lambdaName) {
            const storage = await instance.storage()
            const lambdaBytes = await storage.lambdas.get(lambdaName);
            return lambdaBytes;
        }
    };
};

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