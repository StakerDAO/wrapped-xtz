const { Tezos } = require('@taquito/taquito');
const compileContract = require('../../scripts/lambdaCompiler/compileContract');

const ovenHelpers = (instance) => {
    return {
        instance: instance,
        // this helper function only deposits from an implicit account
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
            // oven storage is a single address, not a full record
            return (await instance.storage())
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
    originate: async function(initialStorage) {
        const code = compileContract(
            'contracts/partials/wxtz/core/test/oven/ovenWrapperMockContract.religo',
        );
        const originationOperation = await Tezos.contract.originate({
            code: code,
            storage: initialStorage
        });
        await originationOperation.confirmation(1);
        console.log('Originated oven at', originationOperation.contractAddress);

        const ovenHelpers = await this.at(originationOperation.contractAddress);
        return {    
            ovenHelpers,
            ovenAddress: originationOperation.contractAddress
        };
    },
    at: async (address) => {
        const instance = await Tezos.contract.at(address);
        return ovenHelpers(instance);
    }
}