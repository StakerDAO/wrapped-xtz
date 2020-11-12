const tzip7 = artifacts.require('tzip-7');
const { Tezos } = require('@taquito/taquito');

const tzip7Helpers = (instance) => {
    return {
        setAdministrator: async (administratorAddress) => {
            const operation = await instance.methods
                .setAdministrator(administratorAddress)
                .send();
            return await operation.confirmation(1);
        }
    }
}

module.exports = {
    originate: async function(initialStorage) {
        const instance = await tzip7.new(initialStorage);
        const tzip7Helpers = await this.at(instance.address);
        console.log('Originated TZIP-7 at', instance.address);
        return {
            instance,
            tzip7Helpers,
            tzip7Address: instance.address
        };
    },
    at: async function(address) {
        const instance = await Tezos.contract.at(address);
        return tzip7Helpers(instance);
    }
}