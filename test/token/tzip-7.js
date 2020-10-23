const tzip7 = artifacts.require('tzip-7');
const crypto = require('crypto');
const { expect } = require('chai').use(require('chai-as-promised'));
const { Tezos, UnitValue, ParameterSchema } = require('@taquito/taquito')
const { InMemorySigner } = require('@taquito/signer')

const { alice, bob } = require('./../../scripts/sandbox/accounts');

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
};

function hash(payload) {
    const data = Buffer.from(hexToBytes(payload))
    const hash = crypto.createHash('sha256')
    hash.update(data)
    return `${ hash.digest('hex') }`
};

contract('TZIP-7 token contract', accounts => {
    let storage;
    let tzip7_instance;
    let rpc;

    before(async () => {
        tzip7_instance = await tzip7.deployed();
        /**
         * Display the current contract address for debugging purposes
         */
        console.log('Contract deployed at:', tzip7_instance.address);
        /**
         * Final setup for test suite
         * Read host from TruffleContract
         */
        rpc = tzip7_instance.constructor.currentProvider.host;
    });
    
    /**
     *  Token tests
     */
    it("should mint 10 tokens for Alice", async () => {
        // calling the token contract %mint entrypoint
        await tzip7_instance.mint(alice.pkh, 10);
        storage = await tzip7_instance.storage();
        actualBalance = await storage.token.ledger.get(alice.pkh);
        expectedBalance = 20;
        expect(Number(actualBalance)).to.equal(expectedBalance);
        expect(Number(storage.token.totalSupply)).to.equal(expectedBalance);
    });

    it("should not change the adminstrator's address for Bob", async() => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7_instance.address);
        // call the token contract at the %setAdministrator entrypoint and passing Bob's address
        await expect(contract.methods.setAdministrator(bob.pkh).send()).to.be.rejectedWith("NoPermission");
    });

    it("should burn 10 tokens for Alice", async () => {
        // calling the token contract %burn entrypoint
        await tzip7_instance.burn(alice.pkh, 10);
        storage = await tzip7_instance.storage();
        actualBalance = await storage.token.ledger.get(alice.pkh);
        expectedBalance = 10;
        expect(Number(actualBalance)).to.equal(expectedBalance);
        expect(Number(storage.token.totalSupply)).to.equal(expectedBalance);
    });
    
    it("should fail for burning more tokens than Alice has", async () => {
        // calling the token contract %burn entrypoint
        await expect(tzip7_instance.burn(alice.pkh, 20)).to.be.rejectedWith("NotEnoughBalance");
    });

    it("should not burn any tokens for someone other than the admin", async() => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7_instance.address);
        // call the token contract at the %burn entrypoint
        await expect(contract.methods.burn(alice.pkh, 5).send()).to.be.rejectedWith("NoPermission");
    });

    it("should pause all transfer and approve operations", async () => {
        // call the token contract at the %setPause entrypoint to pause all operations
        await tzip7Instance.setPause(true)
        // read contract's storage
        storage = await tzip7Instance.storage();
        expect(storage.token.paused).to.be.true;
        // send a transfer operation
        const from_ = alice.pkh;
        const to_ = bob.pkh;
        const value = 1;
        await expect(tzip7Instance.transfer(from_, to_, value)).to.be.rejectedWith("TokenOperationsArePaused");
        // send an approve operation
        await expect(tzip7Instance.approve(bob.pkh, 2)).to.be.rejectedWith("TokenOperationsArePaused");
    });
  
});
