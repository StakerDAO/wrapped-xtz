const manager = artifacts.require('manager');
const brokenManager = artifacts.require('brokenManager');
const { Tezos, UnitValue } = require('@taquito/taquito');

const managerHelpers = (instance) => {
    return {
        instance: instance,
        withdraw: async function(amount, ovenAddress) {
            const operation = await instance.methods.withdraw(amount, ovenAddress).send()
            await operation.confirmation(1);
            return operation
        },
        setDelegate: async function(delegate, ovenAddress) {
            const operation = await instance.methods.setDelegate(delegate, ovenAddress).send()
            await operation.confirmation(1);
            return operation
        },
        deposit: async function(coreAddress, sendParams) {
            const operation = await instance.methods.deposit(coreAddress).send(sendParams)
            await operation.confirmation(1);
            return operation;
        }
    }
};

module.exports = {
    originate: async function(broken) {
        let instance;
        if (broken) {
            instance = await brokenManager.new(UnitValue);
        } else {
            instance = await manager.new(UnitValue);
        };
        const managerHelpers = await this.at(instance.address);
    
        return {
            instance,
            managerHelpers,
            managerAddress: instance.address
        };
    },
    at: async function(address) {
        const instance = await Tezos.contract.at(address);
        return managerHelpers(instance);
    }
};