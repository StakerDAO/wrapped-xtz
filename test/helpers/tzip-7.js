const tzip7 = artifacts.require('tzip-7');
const { Tezos } = require('@taquito/taquito');

const tzip7Helpers = (instance) => {
    return {
        instance: instance,
        setAdministrator: async function(administratorAddress) {
            const operation = await instance.methods
                .setAdministrator(administratorAddress)
                .send();
            return await operation.confirmation(1);
        },
        getStorage: async function() {
            return await instance.storage();
        },
        getAdministrator: async function() {
            return (await this.getStorage()).token.admin;
        },
        getPauseGuardian: async function() {
            return (await this.getStorage()).token.pauseGuardian
        },
        getBalance: async function(address) {
            const balance = await (await this.getStorage()).token.ledger.get(address) || 0;
            return Number(balance);
        },
        setPause: async function(boolean) {
            const operation = await instance.methods.setPause(boolean).send();
            await operation.confirmation(1);
            return operation
        },
        getPauseState: async function() {
            return (await this.getStorage()).token.paused;
        },
        approve: async function(spender, value) {
            const operation = await instance.methods.approve(
                spender,
                value
            ).send();
            await operation.confirmation(1);
            return operation
        },
        approveCAS: async function(expected, spender, value) {
            const operation = await instance.methods.approveCAS(
                expected, // expected allowance value
                spender,
                value
            ).send();
            await operation.confirmation(1);
            return operation
        },
        mint: async function(tokenOwner, value) {
            const operation = await instance.methods.mint(
                tokenOwner,
                value
            ).send();
            await operation.confirmation(1);
            return operation
        },
        burn: async function(tokenOwner, value) {
            const operation = await instance.methods.burn(
                tokenOwner,
                value
            ).send();
            await operation.confirmation(1);
            return operation
        },
        getAllowance: async function(owner, spender) {
            // michelson pair as key
            const key = {
                0: owner, 
                1: spender
            };
            const approvals = (await this.getStorage()).token.approvals;
            const allowanceValue = await approvals.get(key);
            return allowanceValue.toNumber();
        },
        transfer: async function(from, to, value) {
            const operation = await instance.methods.transfer(
                from,
                to,
                value
            ).send();
            await operation.confirmation(1);
            return operation
        },
        getTotalSupply: async function() {
            const totalSupply = (await this.getStorage()).token.totalSupply;
            return totalSupply.toNumber()
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