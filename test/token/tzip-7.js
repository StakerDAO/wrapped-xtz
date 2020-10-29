const tzip7 = artifacts.require('tzip-7');
const crypto = require('crypto');
const { expect } = require('chai').use(require('chai-as-promised'));
const { Tezos, UnitValue, ParameterSchema } = require('@taquito/taquito')
const { InMemorySigner } = require('@taquito/signer')

const { alice, bob } = require('./../../scripts/sandbox/accounts');
const { initialStorage } = require('./../../migrations/2_deploy_tzip-7');

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
    let tzip7Instance;
    let rpc;

    before(async () => {
        tzip7Instance = await tzip7.deployed();
        // display the current contract address for debugging purposes
        console.log('Contract deployed at:', tzip7Instance.address);
        // read host from TruffleContract
        rpc = tzip7Instance.constructor.currentProvider.host;
    });
    
    /**
     *  Token tests
     */
    it("should mint 10 tokens for Alice", async () => {
        // read current storage
        storage = await tzip7Instance.storage();
        let initialBalance = await storage.token.ledger.get(alice.pkh);
        initialBalance = Number(initialBalance);
        const initialTotalSupply = initialStorage.token.totalSupply;

        const tokensToMint = 10;
        // calling the token contract %mint entrypoint
        await tzip7Instance.mint(alice.pkh, tokensToMint);
        // read current storage
        storage = await tzip7Instance.storage();
        let actualBalance = await storage.token.ledger.get(alice.pkh);
        actualBalance = Number(actualBalance);
        let totalSupplyAfterOperation = storage.token.totalSupply;
        totalSupplyAfterOperation = Number(totalSupplyAfterOperation);

        expect(actualBalance).to.equal(initialBalance + tokensToMint);
        expect(totalSupplyAfterOperation).to.equal(initialTotalSupply + tokensToMint);
    });

    it("should not change the administrator's address for Bob", async() => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7Instance.address);
        // call the token contract at the %setAdministrator entrypoint and passing Bob's address
        await expect(contract.methods.setAdministrator(bob.pkh).send()).to.be.rejectedWith("NoPermission");
    });

    it("should burn 10 tokens for Alice", async () => {
        // read current storage
        storage = await tzip7Instance.storage();
        let initialBalance = await storage.token.ledger.get(alice.pkh);
        initialBalance = Number(initialBalance);
        let initialTotalSupply = storage.token.totalSupply;
        initialTotalSupply = Number(initialTotalSupply);

        const tokensToBurn = 10;
        // calling the token contract %burn entrypoint
        await tzip7Instance.burn(alice.pkh, tokensToBurn);
        // read current storage
        storage = await tzip7Instance.storage();
        let totalSupplyAfterOperation = storage.token.totalSupply;
        totalSupplyAfterOperation = Number(totalSupplyAfterOperation);
        let actualBalance = await storage.token.ledger.get(alice.pkh);
        actualBalance = Number(actualBalance);
        // compare balance and total supply
        expect(actualBalance).to.equal(initialBalance - tokensToBurn);
        expect(totalSupplyAfterOperation).to.equal((initialTotalSupply - tokensToBurn));
    });
    
    it("should fail for burning more tokens than Alice has", async () => {
        // calling the token contract %burn entrypoint
        await expect(tzip7Instance.burn(alice.pkh, 100)).to.be.rejectedWith("NotEnoughBalance");
    });

    it("should not burn any tokens for someone other than the admin", async() => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7Instance.address);
        // call the token contract at the %burn entrypoint
        await expect(contract.methods.burn(alice.pkh, 5).send()).to.be.rejectedWith("NoPermission");
    });

    it("should fail to change guardian address by third party", async () => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7Instance.address);
        // call the token contract at the %burn entrypoint
        await expect(contract.methods.setPauseGuardian(bob.pkh).send()).to.be.rejectedWith("NoPermission");
    });

    it("should change the (pause) guardian to Bob's address", async () => {
        // only admin has permission 
        // check that Alice is the current admin
        storage = await tzip7Instance.storage();
        expect(storage.token.admin).to.equal(alice.pkh);
        // check that Bob is not the pause guardian
        expect(storage.token.pauseGuardian).not.to.equal(bob.pkh);
        // Alice changes as admin the pause guardian to Bob's address
        await tzip7Instance.setPauseGuardian(bob.pkh);
        // read the storage
        storage = await tzip7Instance.storage();
        expect(storage.token.pauseGuardian).to.equal(bob.pkh);
    });

    it("should not allow the admin to pause all transfer, approve, mint and burn operations", async () => {
        // read storage before operations
        storage = await tzip7Instance.storage();
        // check that Alice is the admin
        expect(storage.token.admin).to.equal(alice.pkh);
        // check that Alice is not the pause guardian
        expect(storage.token.pauseGuardian).not.to.equal(alice.pkh)
        // call the token contract at the %setPause entrypoint to pause all operations
        await expect(tzip7Instance.setPause(true)).to.be.rejectedWith("NoPermission");
        // read contract's storage after the operation
        storage = await tzip7Instance.storage();
        expect(storage.token.paused).to.be.false;
    });

    it("should pause all transfer, approve, mint and burn operations", async () => {
        // switching to Bob's secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7Instance.address);
        // call the token contract at the %setPause entrypoint to pause all operations
        const operation = await contract.methods.setPause(true).send();
        await operation.confirmation(1);
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
        // mint 5 tokens
        await expect(tzip7Instance.mint(alice.pkh, 5)).to.be.rejectedWith("TokenOperationsArePaused");
        // burn 5 tokens
        await expect(tzip7Instance.burn(alice.pkh, 5)).to.be.rejectedWith("TokenOperationsArePaused");
    });

    it("should not allow the guardian to unpause all transfer, approve, mint and burn operations", async () => {
        // switching to guardian's (Bob's) secret key
        Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
        // load the contract for the Tezos Taquito instance
        const contract = await Tezos.contract.at(tzip7Instance.address);
        // call the token contract at the %setPause entrypoint to pause all operations
        await expect(contract.methods.setPause(false).send()).to.be.rejectedWith("NoPermission");
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
        // mint 5 tokens
        await expect(tzip7Instance.mint(alice.pkh, 5)).to.be.rejectedWith("TokenOperationsArePaused");
        // burn 5 tokens
        await expect(tzip7Instance.burn(alice.pkh, 5)).to.be.rejectedWith("TokenOperationsArePaused");
    });

    it("should allow the admin to unpause all transfer, approve, mint and burn operations", async () => {
        // read storage before operations
        storage = await tzip7Instance.storage();
        // check that Alice is the admin
        expect(storage.token.admin).to.equal(alice.pkh);
        // check that Alice is not the pause guardian
        expect(storage.token.pauseGuardian).not.to.equal(alice.pkh)
        // call the token contract at the %setPause entrypoint to pause all operations
        await tzip7Instance.setPause(false);
        // read contract's storage after the operation
        storage = await tzip7Instance.storage();
        expect(storage.token.paused).to.be.false;

        // operations are fulfilled
        // send a transfer operation
        const from_ = alice.pkh;
        const to_ = bob.pkh;
        const value = 1;
        await tzip7Instance.transfer(from_, to_, value);
        // send an approve operation
        await tzip7Instance.approve(bob.pkh, 2);
        // mint 5 tokens
        await tzip7Instance.mint(alice.pkh, 5);
        // burn 5 tokens
        await tzip7Instance.burn(alice.pkh, 5);
    });
  
});
    