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
        }
    };
};

module.exports = {
    at: async (address) => {
        const instance = await Tezos.contract.at(address);
        return ovenHelpers(instance);
    }
}