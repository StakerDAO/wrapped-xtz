const tzip7 = artifacts.require('tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));
const { Tezos } = require('@taquito/taquito')
const { InMemorySigner } = require('@taquito/signer')

const { alice, bob } = require('./../../scripts/sandbox/accounts');
const { initialStorage } = require('./../../migrations/2_deploy_tzip-7');

contract('TZIP-7 token contract', accounts => {
    let storage;
    let tzip7Instance;
    let rpc;

    async function updateStorage() {
        storage = await tzip7Instance.storage();
    };
    
    async function getBalance(address) {
        await updateStorage();
        // read balance and if no address was registered yet, assign a 0 balance
        let balance = await storage.token.ledger.get(address) || 0;
        balance = Number(balance);
        return balance
    };

    before(async () => {
        tzip7Instance = await tzip7.deployed();
        // display the current contract address for debugging purposes
        console.log('Contract deployed at:', tzip7Instance.address);
        // read host from TruffleContract
        rpc = tzip7Instance.constructor.currentProvider.host;
    });

    beforeEach(async () => {
        // read current storage
        await updateStorage();
    });
    
    describe("Mint and Burn", () => {
        it("should mint 10 tokens for Alice", async () => {
            const initialBalance = await getBalance(alice.pkh);
            const initialTotalSupply = initialStorage.token.totalSupply;

            // calling the token contract %mint entrypoint
            const tokensToMint = 10;
            await tzip7Instance.mint(alice.pkh, tokensToMint);
            // read current storage
            await updateStorage();
            const actualBalance = await getBalance(alice.pkh);
            let totalSupplyAfterOperation = storage.token.totalSupply;
            totalSupplyAfterOperation = Number(totalSupplyAfterOperation);
    
            expect(actualBalance).to.equal(initialBalance + tokensToMint);
            expect(totalSupplyAfterOperation).to.equal(initialTotalSupply + tokensToMint);
        });
    
        it("should burn 10 tokens for Alice", async () => {
            let initialBalance = await getBalance(alice.pkh);
            let initialTotalSupply = storage.token.totalSupply;
            initialTotalSupply = Number(initialTotalSupply);
    
            const tokensToBurn = 10;
            // calling the token contract %burn entrypoint
            await tzip7Instance.burn(alice.pkh, tokensToBurn);
            // read current storage
            await updateStorage();
            let totalSupplyAfterOperation = storage.token.totalSupply;
            totalSupplyAfterOperation = Number(totalSupplyAfterOperation);
            let actualBalance = await getBalance(alice.pkh);

            // compare balance and total supply
            expect(actualBalance).to.equal(initialBalance - tokensToBurn);
            expect(totalSupplyAfterOperation).to.equal((initialTotalSupply - tokensToBurn));
        });
        
        it("should fail for burning more tokens than Alice has", async () => {
            // calling the token contract %burn entrypoint
            await expect(tzip7Instance.burn(alice.pkh, 100)).to.be.rejectedWith("NotEnoughBalance");
        });
    
        it("should not burn any tokens for someone other than the admin", async () => {
            // switching to Bob's secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
            // load the contract for the Tezos Taquito instance
            const contract = await Tezos.contract.at(tzip7Instance.address);
            // call the token contract at the %burn entrypoint
            await expect(contract.methods.burn(alice.pkh, 5).send()).to.be.rejectedWith("NoPermission");
        });
    });

    describe("Approving allowances", () => {
        const allowanceValue = 5;
        const owner = alice.pkh;
        const spender = bob.pkh;
       
        it("should give Bob an allowance to transfer Alice tokens using approve function", async () => {
            const approveParam = {
                spender: spender,
                value: allowanceValue,
            };
            // Alice gives Bob an allowance to spend
            await tzip7Instance.approve(approveParam.spender, approveParam.value);
           
            // read approvals record from contract's storage by using a pair as key to retrieve the big_map value
            await updateStorage();
            let approvedValue = await storage.token.approvals.get({0: owner, 1: spender});
            approvedValue = Number(approvedValue);
            expect(approvedValue).to.equal(allowanceValue);
        });

        it("should give Bob an allowance to transfer Alice tokens using approveCAS function", async () => {
            
            let approvedValue = await storage.token.approvals.get({0: owner, 1: spender});
            approvedValue = Number(approvedValue);
            const approveParam = {
                expected: approvedValue,
                spender: spender,
                value: allowanceValue,
            };
            // Alice changes Bob's allowance to spend
            await tzip7Instance.approveCAS(approveParam.expected, approveParam.spender, approveParam.value);
           
            await updateStorage();
            // read approvals record from contract's storage by using a pair as key to retrieve the big_map value
            let approvedValueAfterOperation = await storage.token.approvals.get({0: owner, 1: spender});
            approvedValueAfterOperation = Number(approvedValueAfterOperation);
            expect(approvedValueAfterOperation).to.equal(approveParam.value);
        });

        it("should not allow Bob to transfer more tokens than approved", async () => {
            const transferParam = {
                from: alice.pkh,
                to: bob.pkh,
                value: allowanceValue + 1,
            };
            // switching to Bob's secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
            // load the contract for the Tezos Taquito instance
            const contract = await Tezos.contract.at(tzip7Instance.address);
            await expect(contract.methods.transfer(
                transferParam.from, 
                transferParam.to, 
                transferParam.value
            ).send()).to.be.rejectedWith("NotEnoughAllowance");
        });

        it("should allow Bob to transfer his full allowance", async () => {
            const balanceAliceBeforeTransfer = await getBalance(alice.pkh);
            const balanceBobBeforeTransfer = await getBalance(bob.pkh);
        
            const transferParam = {
                from: alice.pkh,
                to: bob.pkh,
                value: allowanceValue,
            };
            // switching to Bob's secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
            // load the contract for the Tezos Taquito instance
            const contract = await Tezos.contract.at(tzip7Instance.address);
            const operation = await contract.methods.transfer(
                transferParam.from, 
                transferParam.to, 
                transferParam.value
            ).send();
            // wait for 1 block confirmation
            await operation.confirmation(1);
            
            const balanceAliceAfterTransfer = await getBalance(alice.pkh);
            const balanceBobAfterTransfer = await getBalance(bob.pkh);
            expect(balanceAliceAfterTransfer).to.equal(balanceAliceBeforeTransfer - transferParam.value);
            expect(balanceBobAfterTransfer).to.equal(balanceBobBeforeTransfer + transferParam.value);
            
            await updateStorage();
            let approvedValue = await storage.token.approvals.get({0: alice.pkh, 1: bob.pkh});
            approvedValue = Number(approvedValue);
            expect(approvedValue).to.equal(0);
        });

        it("should change the allowance value from a non-zero value to zero using approve", async () => {
            const approveParam = {
                spender: bob.pkh,
                value: allowanceValue,
            };
            // Alice gives Bob an allowance to spend
            await tzip7Instance.approve(approveParam.spender, approveParam.value);
            const approveParamToZero = {
                spender: bob.pkh,
                value: 0,
            };
            await tzip7Instance.approve(approveParamToZero.spender, approveParamToZero.value);
        });

        it("should not change the allowance value from a non-zero value to a non-zero value using approve", async () => {
            const approveParam = {
                spender: bob.pkh,
                value: allowanceValue,
            };
            // Alice gives Bob an allowance to spend
            await tzip7Instance.approve(approveParam.spender, approveParam.value);
            await expect(tzip7Instance.approve(approveParam.spender, approveParam.value)).to.be.rejectedWith("UnsafeAllowanceChange");
        });

        it("should change the allowance value from a non-zero value to a non-zero value using approveCAS", async () => {
            // read approvals record from contract's storage by using a pair as key to retrieve the big_map value
            let approvedValue = await storage.token.approvals.get({0: owner, 1: spender});
            approvedValue = Number(approvedValue);
            expect(approvedValue).to.be.a('number');

            const approveCASParam = {
                expected: approvedValue,
                spender: spender,
                value: allowanceValue,
            };
            // Alice changes Bob's allowance
            await tzip7Instance.approveCAS(approveCASParam.expected, approveCASParam.spender, approveCASParam.value);
            
            await updateStorage();
            let approvedValueAfterOperation = await storage.token.approvals.get({0: alice.pkh, 1: bob.pkh});
            approvedValueAfterOperation = Number(approvedValueAfterOperation);
            expect(approvedValueAfterOperation).to.equal(approveCASParam.value);
        });

    });
    
    describe("Changing Permissions", () => {
        it("should not change the administrator's address for Bob", async () => {
            // switching to Bob's secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
            // load the contract for the Tezos Taquito instance
            const contract = await Tezos.contract.at(tzip7Instance.address);
            // call the token contract at the %setAdministrator entrypoint and passing Bob's address
            await expect(contract.methods.setAdministrator(bob.pkh).send()).to.be.rejectedWith("NoPermission");
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
            expect(storage.token.admin).to.equal(alice.pkh);
            // check that Bob is not the pause guardian
            expect(storage.token.pauseGuardian).not.to.equal(bob.pkh);
            // Alice changes as admin the pause guardian to Bob's address
            await tzip7Instance.setPauseGuardian(bob.pkh);
            // read the storage
            storage = await tzip7Instance.storage();
            expect(storage.token.pauseGuardian).to.equal(bob.pkh);
        });
    });
   
    describe("Pause", () => {
      
        it("should not allow the admin to pause all transfer, approve, mint and burn operations", async () => {
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
            // changing pause guardian to Bob's address
            await tzip7Instance.setPauseGuardian(bob.pkh);
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
            await updateStorage();
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

    describe("Transfer", () => {
        const transferParam = {
            from_: alice.pkh,
            to_: bob.pkh,
            value: 2
        };
       
        it("should transfer token to Bob", async () => {
            const balanceAliceBeforeTransfer = await getBalance(alice.pkh);
            const balanceBobBeforeTransfer = await getBalance(bob.pkh);
        
            await tzip7Instance.transfer(
                transferParam.from_, 
                transferParam.to_, 
                transferParam.value
            );

            const balanceAliceAfterTransfer = await getBalance(alice.pkh);
            const balanceBobAfterTransfer = await getBalance(bob.pkh);
            
            expect(balanceAliceAfterTransfer).to.equal(balanceAliceBeforeTransfer - transferParam.value);
            expect(balanceBobAfterTransfer).to.equal(balanceBobBeforeTransfer + transferParam.value);
        });

        it("should not allow Alice to transfer more tokens than she owns", async () => {
            const balanceAliceBeforeTransfer = await getBalance(alice.pkh);
            const value = balanceAliceBeforeTransfer + transferParam.value;
            await expect(tzip7Instance.transfer(transferParam.from_, transferParam.to_, value)).to.be.rejectedWith("NotEnoughBalance");
        });

        it("should not allow Bob to spend Alice' tokens", async () => {
            // switching to guardian's (Bob's) secret key
            Tezos.setProvider({rpc: rpc, signer: await InMemorySigner.fromSecretKey(bob.sk)});
            // load the contract for the Tezos Taquito instance
            const contract = await Tezos.contract.at(tzip7Instance.address);
            // Bob transfers Alice' tokens
            await expect(contract.methods.transfer(transferParam.from_, transferParam.to_, transferParam.value).send()).to.be.rejectedWith("NotEnoughAllowance");
        });
    });
});
