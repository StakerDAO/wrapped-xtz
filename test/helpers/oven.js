const { Tezos } = require('@taquito/taquito');

const ovenHelpers = (instance) => {
    return {
        default: async (xtzAmount) => {
            const operation = await Tezos.contract.transfer({
                to: instance.address,
                amount: xtzAmount,
                mutez: true
            });

            return await operation.confirmation(1);
        },
        getDelegate: async () => {
            return await Tezos.rpc.getDelegate(instance.address);
        },
        getCoreAddress: async () => {
            return (await instance.storage()).address
        },
        withdraw: async (amount) => {
            const operation = await instance.methods.withdraw(amount).send();
            return operation.confirmation(1);
        },
        setDelegate: async (address) => {
            const operation = await instance.methods.setDelegate(address).send();
            return operation.confirmation(1);
        }
    };
};

module.exports = {
    at: async (address) => {
        const instance = await Tezos.contract.at(address);
        return ovenHelpers(instance);
    }
}