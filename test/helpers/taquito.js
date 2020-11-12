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
    }
}