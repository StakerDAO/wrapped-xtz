const { Tezos } = require('@taquito/taquito');

const ovenHelpers = (instance) => {
    return {
        instance: instance,
        default: async (xtzAmount) => {
            const operation = await Tezos.contract.transfer({
                to: instance.address,
                amount: xtzAmount,
                mutez: true
            });
            await operation.confirmation(1);
            return operation
        },
        getDelegate: async () => {
            return await Tezos.rpc.getDelegate(instance.address);
        },
        getCoreAddress: async () => {
            return (await instance.storage()).address
        },
        withdraw: async (amount, sendParams) => {
            const operation = await instance.methods.withdraw(amount).send({
                mutez: true,
                ...sendParams
            });
            await operation.confirmation(1);
            return operation 
        },
        setDelegate: async (address) => {
            const operation = await instance.methods.setDelegate(address).send();
            await operation.confirmation(1);
            return operation
        }
    };
};

module.exports = {
    at: async (address) => {
        const instance = await Tezos.contract.at(address);
        return ovenHelpers(instance);
    }
}