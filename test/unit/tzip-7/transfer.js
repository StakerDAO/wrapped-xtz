
const tzip7 = artifacts.require('tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));

const { bob, carol, chuck, dave, walter } = require('../../../scripts/sandbox/accounts');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const { contractErrors } = require('../../../helpers/constants');
const { TezosOperationError } = require('@taquito/taquito');


contract('TZIP-7 token contract %transfer entrypoint', () => {
    let helpers = {};
    const pauseGuardian = walter;
    let balances;
    
    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.withApprovals);
        // display the current contract address for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);
        
        await _taquitoHelpers.initialize();
        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
        balances = {};
    });

    describe('scenario where token owner performs transfer', () => {

        const transferParameter = {
            from: bob.pkh,
            to: undefined,
            value: undefined,
        };

        beforeEach(async () => {
            await _taquitoHelpers.setSigner(bob.sk);
            transferParameter.value = _tzip7InitialStorage.withApprovals.token.ledger.get(bob.pkh); // full balance
        });

        it('should transfer for token owner', async () => {
            transferParameter.to = carol.pkh;

            const operationPromise = helpers.tzip7.transfer(transferParameter);
            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        it('should fail if token operations are paused', async () => {
            // call %setPause with pause guardian
            await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                await helpers.tzip7.setPause(true);
            });
            transferParameter.to = carol.pkh;
            transferParameter.value = 100;

            const operationPromise = helpers.tzip7.transfer(transferParameter);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
        }); 

        describe('transfer to another party', () => {

            beforeEach(async () => {
                transferParameter.to = carol.pkh;

                balances.senderBefore = await helpers.tzip7.getBalance(transferParameter.from);
                balances.recipientBefore = await helpers.tzip7.getBalance(transferParameter.to);

                await helpers.tzip7.transfer(transferParameter);
            });

            it('should decrease the balance of sender', async () => {
                balances.senderAfter = await helpers.tzip7.getBalance(transferParameter.from);
                expect(balances.senderAfter).to.equal(balances.senderBefore - transferParameter.value);
            });
            
            it('should increase the balance of recipient', async () => {
                balances.recipientAfter = await helpers.tzip7.getBalance(transferParameter.to);
                expect(balances.recipientAfter).to.equal(balances.recipientBefore + transferParameter.value);
            });
        });

        describe('transfer to its own address', () => {

            beforeEach(async () => {
                transferParameter.to = bob.pkh;

                balances.senderBefore = await helpers.tzip7.getBalance(transferParameter.from);
                balances.recipientBefore = await helpers.tzip7.getBalance(transferParameter.to);

                await helpers.tzip7.transfer(transferParameter);
            });

            it('should not change the balance of sender', async () => {
                balances.senderAfter = await helpers.tzip7.getBalance(transferParameter.from);
                expect(balances.senderAfter).to.equal(balances.senderBefore);
            });
            
            it('should not change the balance of recipient', async () => {
                balances.recipientAfter = await helpers.tzip7.getBalance(transferParameter.to);
                expect(balances.recipientAfter).to.equal(balances.recipientBefore);
            });
        });
 
        it('should fail for transferring above available balance', async () => {
            transferParameter.to = carol.pkh;
            transferParameter.value += 1; // above available balance

            const operationPromise = helpers.tzip7.transfer(transferParameter);

            await expect(operationPromise).to.be.eventually.rejected
                .be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.notEnoughBalance);
        });
    });

    describe('scenario where token spender is not token owner, but approved allowance is used', () => {
        const accounts = {
            owner: bob,
            spender: carol,
            recipient: dave
        };
        const transferParameter = {
            from: accounts.owner.pkh,
            to: accounts.recipient.pkh,
            value: undefined,
        };
        let allowance = {};

        beforeEach(async () => {
            await _taquitoHelpers.setSigner(accounts.spender.sk); // carol is spender

            allowance.before = await helpers.tzip7.getAllowanceFromStorage(
                _tzip7InitialStorage.withApprovals,
                accounts.owner.pkh,
                accounts.spender.pkh
            );
            
            transferParameter.value = allowance.before; // full allowance
        });

        describe('scenario with enough allowance and balance', () => {

            beforeEach(async () => {
                balances.senderBefore = await helpers.tzip7.getBalance(transferParameter.from);
                balances.recipientBefore = await helpers.tzip7.getBalance(transferParameter.to);

                await helpers.tzip7.transfer(transferParameter);
            });

            it('should decrease the balance of sender', async () => {
                balances.senderAfter = await helpers.tzip7.getBalance(transferParameter.from);
                expect(balances.senderAfter).to.equal(balances.senderBefore - transferParameter.value);
            });
            
            it('should increase the balance of recipient', async () => {
                balances.recipientAfter = await helpers.tzip7.getBalance(transferParameter.to);
                expect(balances.recipientAfter).to.equal(balances.recipientBefore + transferParameter.value);
            });

            it('should decrease allowance of spender', async () => {
                allowance.after = await helpers.tzip7.getAllowance(accounts.owner.pkh, accounts.spender.pkh);
                expect(allowance.after).to.equal(allowance.before - transferParameter.value)
            });
        });

        describe('scenario with enough allowance, but not enough balance', () => {
            
            beforeEach(async () => {
                await _taquitoHelpers.signAs(accounts.owner.sk, async () => {
                    // drain account of token owner
                    const transferParameterToDrainAccount = {
                        from: transferParameter.from,
                        to: transferParameter.to,
                        value: await _tzip7InitialStorage.withApprovals.token.ledger.get(transferParameter.from)
                    };
            
                    await helpers.tzip7.transfer(transferParameterToDrainAccount);
                });
            });

            it('should fail for transferring above available balance of owner', async () => {
                const operationPromise = helpers.tzip7.transfer(transferParameter);

                await expect(operationPromise).to.be.eventually.rejected
                    .be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.notEnoughBalance);
            });
        });
      
        it('should fail for transferring above available allowance', async () => {
            transferParameter.value += 1;
            
            const operationPromise = helpers.tzip7.transfer(transferParameter);
            await expect(operationPromise).to.be.eventually.rejected
                .be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.notEnoughAllowance);
        });

        it('should fail for non-token owner and without any allowance', async () => {
            transferParameter.to = chuck.pkh;
            await _taquitoHelpers.setSigner(chuck.sk);

            const operationPromise = helpers.tzip7.transfer(transferParameter);
            await expect(operationPromise).to.be.eventually.rejected
                .be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.notEnoughAllowance);
        });
    });

    afterEach(async () => {
        const totalSupplyBeforeOperation = _tzip7InitialStorage.withApprovals.token.totalSupply;
        const totalSupplyAfterOperation = await helpers.tzip7.getTotalSupply();
        expect(totalSupplyAfterOperation).to.equal(totalSupplyBeforeOperation);
    });
});
