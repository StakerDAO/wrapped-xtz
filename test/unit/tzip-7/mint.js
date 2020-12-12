const tzip7 = artifacts.require('tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));

const { alice, bob, chuck, walter } = require('../../../scripts/sandbox/accounts');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const { contractErrors } = require('../../../helpers/constants');
const { TezosOperationError } = require('@taquito/taquito');


contract('TZIP-7 token contract %mint entrypoint', () => {
    let helpers = {};
    const pauseGuardian = walter;
    const admin = alice;
    const thirdParty = chuck; // malicious intent
    
    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.base);
        // display the current contract address for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);

        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(admin.sk);

        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
    });

    it('should be able to call %mint by the admin', async () => {
        const operationPromise = helpers.tzip7.mint(bob.pkh, 500000);
        await expect(operationPromise).to.be.eventually.fulfilled;
    });

    it('should fail if not called by admin', async () => {
        await _taquitoHelpers.setSigner(thirdParty.sk);
        const operationPromise = helpers.tzip7.mint(admin.pkh, 500000);
        
        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.senderIsNotAdmin);
    });

    it('should fail if called by pause guardian', async () => {
        await _taquitoHelpers.setSigner(pauseGuardian.sk);
        const operationPromise = helpers.tzip7.mint(admin.pkh, 500000);
        
        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.senderIsNotAdmin);
    });

    it('should fail if token operations are paused', async () => {
         // call %setPause with pause guardian
         await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
            await helpers.tzip7.setPause(true);
        });
        
        const operationPromise = helpers.tzip7.mint(
            bob.pkh, // token owner
            100 // value
        );
        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
    });

    describe('Effects of mint', () => {
        let balances = {};
        const tokenHolder = bob;
        const admin = alice;
        const amountToMint = 5000000 // 5 wXTZ

        beforeEach(async () => {
            balances.tokenHolderBeforeMint = await helpers.tzip7.getBalance(tokenHolder.pkh);
            balances.adminBeforeMint = await helpers.tzip7.getBalance(admin.pkh);
            balances.totalSupplyBeforeMint = await helpers.tzip7.getTotalSupply();

            await helpers.tzip7.mint(tokenHolder.pkh, amountToMint);
        });

        it('should increase the amount of tokens in balance', async () => {
            balances.tokenHolderAfterMint = await helpers.tzip7.getBalance(tokenHolder.pkh);
            expect(balances.tokenHolderAfterMint).to.equal(balances.tokenHolderBeforeMint + amountToMint);
        });
        
        it('should increase the total supply', async () => {
            balances.totalSupplyAfterMint = await helpers.tzip7.getTotalSupply();
            expect(balances.totalSupplyAfterMint).to.equal(balances.totalSupplyBeforeMint + amountToMint);
        });

        it('should not increase the tokens for the caller of the operation', async () => {
            balances.adminAfterMint = await helpers.tzip7.getBalance(admin.pkh);
            expect(balances.adminBeforeMint).to.equal(balances.adminAfterMint);
        });
    });    
});
