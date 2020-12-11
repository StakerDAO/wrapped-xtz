const { InMemorySigner } = require('@taquito/signer');
const { Tezos } = require('@taquito/taquito');

module.exports = {
    initialize: async () => {
        const rpc = "http://localhost:8732";
        Tezos.setRpcProvider(rpc);
    },
    setSigner: async (secretKey) => {
        const signer = (await InMemorySigner.fromSecretKey(secretKey));
        Tezos.setSignerProvider(signer);
    },
    signAs: async (secretKey, fn) => {
        const oldSigner = Tezos.signer;
        const signer = (await InMemorySigner.fromSecretKey(secretKey));
        Tezos.setSignerProvider(signer);
        // run the function using the new temporary signer
        const output = await fn();
        // revert the signer back to the old signer
        Tezos.setSignerProvider(oldSigner);
        return output;
    },
    getXTZBalance: async (address) => {
        return (await Tezos.tz.getBalance(address)).toNumber();
    },
    transfer: async (to, amount) => {   
        const operation = await Tezos.contract.transfer({ 
            to, 
            amount, 
            mutez: true 
        });
        await operation.confirmation(1)
        return operation
    }
}
