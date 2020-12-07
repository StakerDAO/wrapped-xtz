const tzip7 = artifacts.require('tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));

const { alice, bob, chuck, walter } = require('../../../scripts/sandbox/accounts');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const { contractErrors } = require('../../../helpers/constants');
const { TezosOperationError } = require('@taquito/taquito');


contract('TZIP-7 token contract', () => {
    let helpers = {};
    const pauseGuardian = walter;
    const admin = alice;
    const thirdParty = chuck; // malicious intent
    
    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.burn);
        // display the current contract address for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);

        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(admin.sk);

        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
    });

    it('should be able to call %burn by the admin', async () => {
        const operationPromise = helpers.tzip7.burn(bob.pkh, 500000);
        await expect(operationPromise).to.be.eventually.fulfilled;
    });

    it("should fail for burning more tokens than the balance holds", async () => {
        const totalBalance = await helpers.tzip7.getBalance(bob.pkh);
        const aboveBalance = totalBalance + 1;
        const operationPromise = helpers.tzip7.burn(bob.pkh, aboveBalance);
        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.notEnoughBalance);
    });

    it('should fail if not called by admin', async () => {
        await _taquitoHelpers.setSigner(thirdParty.sk);
        const operationPromise = helpers.tzip7.burn(admin.pkh, 1000000);
        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.senderIsNotAdmin);
    });

    it('should fail if called by pause guardian', async () => {
        await _taquitoHelpers.setSigner(pauseGuardian.sk);
        const operationPromise = helpers.tzip7.burn(admin.pkh, 1000000);
        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.senderIsNotAdmin);
    });

    it('should fail if token operations are paused', async () => {
          // call %setPause with pause guardian
          await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
            await helpers.tzip7.setPause(true);
        });

        const operationPromise = helpers.tzip7.burn(
            bob.pkh, // token owner
            100 // value
        );
        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
    }); 

    describe('Effects of burn', () => {
        let balances = {};
        const tokenHolder = bob;
        const admin = alice;
        const amountToBurn = 5000000 // 5 wXTZ

        beforeEach(async () => {
            balances.tokenHolderBeforeBurn = await helpers.tzip7.getBalance(tokenHolder.pkh);
            balances.adminBeforeBurn = await helpers.tzip7.getBalance(admin.pkh);
            balances.totalSupplyBeforeBurn = await helpers.tzip7.getTotalSupply();

            await helpers.tzip7.burn(tokenHolder.pkh, amountToBurn);
        });

        it('should reduce the amount of tokens in balance', async () => {
            balances.tokenHolderAfterBurn = await helpers.tzip7.getBalance(tokenHolder.pkh);
            expect(balances.tokenHolderAfterBurn).to.equal(balances.tokenHolderBeforeBurn - amountToBurn);
        });
        
        it('should reduce the total supply', async () => {
            balances.totalSupplyAfterBurn = await helpers.tzip7.getTotalSupply();
            expect(balances.totalSupplyAfterBurn).to.equal(balances.totalSupplyBeforeBurn - amountToBurn);
        });

        it('should not reduce the tokens for the caller of the operation', async () => {
            balances.adminAfterBurn = await helpers.tzip7.getBalance(admin.pkh);
            expect(balances.adminBeforeBurn).to.equal(balances.adminAfterBurn);
        });
    });    
});