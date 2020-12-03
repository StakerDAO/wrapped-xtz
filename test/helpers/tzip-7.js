const tzip7 = artifacts.require('tzip-7');
const { Tezos } = require('@taquito/taquito');
const crypto = require('crypto');
const randomBytes = require('random-bytes');

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
            const allowanceValue = await approvals.get(key) || 0;
            return Number(allowanceValue);
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
        },
        setPauseGuardian: async function(pauseGuardianAddress) {
            const operation = await instance.methods
                .setPauseGuardian(pauseGuardianAddress)
                .send();
            return await operation.confirmation(1);
        },
        // Bridge related helpers
        toHexString: function(byteArray) {
            return Array.prototype.map.call(byteArray, function(byte) {
              return ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('');
        },
        hexToBytes: function(hex) {
            for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
            return bytes;
        },
        randomSecret: function() {
            const maxByteLength = 32;
            const bytes = randomBytes.sync(maxByteLength);
            return this.toHexString(bytes)
        },
        hash: function(payload) {
            const data = Buffer.from(this.hexToBytes(payload));
            const hash = crypto.createHash('sha256');
            hash.update(data);
            return `${ hash.digest('hex') }`
        },
        randomHash: function() {
            const secret = this.randomSecret();
            return this.hash(secret)
        },
        getISOTimeWithDelay: function(hours) {
            const timeNow = new Date();
            timeNow.setHours( timeNow.getHours() + hours);
            // Remove milliseconds for Tezos protocol
            timeNow.setMilliseconds(000);
            const timeWithDelay = timeNow.toISOString();
            return timeWithDelay
        },
        lock: async function(swap) {
            const operation = await instance.methods
                .lock(
                    swap.confirmed,
                    swap.fee,
                    swap.releaseTime,
                    swap.secretHash,
                    swap.to,
                    swap.value)
                .send();
            return operation.confirmation(1);
        },
        getSwap: async function(secretHash) {
            const swap = await (await this.getStorage()).bridge.swaps.get(secretHash);
            swap.fee = swap.fee.toNumber();
            swap.value = swap.value.toNumber();
            return swap
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