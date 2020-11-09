module.exports = (instance) => ({
    getBalance: async (address) => {
        return await (await instance.storage()).token.ledger.get(address)
    }
})