const tzip7 = artifacts.require('tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));

const { alice, bob, carol, chuck, walter } = require('../../../scripts/sandbox/accounts');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const { contractErrors } = require('../../../helpers/constants');
const { TezosOperationError } = require('@taquito/taquito');


contract('TZIP-7 token contract %setPause entrypoint', () => {
    let helpers = {};
    const pauseGuardian = walter;
    const admin = alice;
    const thirdParty = chuck; // malicious intent
    
    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.withApprovals)
        // display the current contract address for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);

        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(admin.sk);

        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
    });

    describe("Pause", () => {
      
        it('should be able to call %setPause by the pause guardian', async () => {
            // call %setPause with pause guardian
            const operationPromise = _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                await helpers.tzip7.setPause(true);
            });
            await expect(operationPromise).to.be.eventually.fulfilled;
        });

        describe('effects of setPause', () => {

            beforeEach(async () => {
                // call %setPause with pause guardian
                await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                    await helpers.tzip7.setPause(true);
                });
            });

            it('should set the pause boolean in storage to true', async () => {
                expect(await helpers.tzip7.getPauseState()).to.be.true;
            });
        });

        describe('permissions', () => {

            it("should fail for the admin to pause operations", async () => {
                const operationPromise = helpers.tzip7.setPause(true);
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.senderIsNotPauseGuardian);
                // storage did not change
                expect(await helpers.tzip7.getPauseState()).to.be.false;
            });

            it("should fail for 3rd parties to pause operations", async () => {
                const operationPromise = _taquitoHelpers.signAs(thirdParty.sk, async () => {
                    await helpers.tzip7.setPause(true);
                });
                await expect(operationPromise).to.be.eventually.rejected
                    .and.be.instanceOf(TezosOperationError)
                    .and.have.property('message', contractErrors.tzip7.senderIsNotPauseGuardian);
                // storage did not change
                expect(await helpers.tzip7.getPauseState()).to.be.false;
            });

            describe('full cycle', () => {

                beforeEach(async () => {
                    // call %setPause with pause guardian
                    await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                        await helpers.tzip7.setPause(true);
                    });
                });

                it('should allow the admin to unpause all transfer, approve, mint and burn operations', async () => {
                    // call the token contract at the %setPause entrypoint to pause all operations
                    await helpers.tzip7.setPause(false);
                    // read contract's storage after the operation
                    expect(await helpers.tzip7.getPauseState()).to.be.false;
    
                    const transferPromise = helpers.tzip7.transfer({
                        from: alice.pkh,
                        to: bob.pkh,
                        value: 1000000 // 1 wXTZ
                    });
                    await expect(transferPromise).to.be.fulfilled;
    
                    const approvePromise = helpers.tzip7.approve(
                        carol.pkh, // spender
                        1000000 // allowance value
                    );
                    await expect(approvePromise).to.be.fulfilled;
    
                    const mintPromise = helpers.tzip7.mint(
                        bob.pkh, // token owner
                        100 // value
                    );
                    await expect(mintPromise).to.be.fulfilled;
    
                    const burnPromise = helpers.tzip7.burn(
                        bob.pkh, // token owner
                        100 // value
                    );
                    await expect(burnPromise).to.be.fulfilled;
                });

                it("should fail for the guardian to unpause", async () => {
                    const operationPromise = _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                        await helpers.tzip7.setPause(false)
                    });
                    await expect(operationPromise).to.be.eventually.rejected
                        .and.be.instanceOf(TezosOperationError)
                        .and.have.property('message', contractErrors.tzip7.senderIsNotAdmin);
                    // storage unchanged
                    expect(await helpers.tzip7.getPauseState()).to.be.true;
                });

                it('should pause, unpause, pause, unpause', async () => {
                    await _taquitoHelpers.signAs(admin.sk, async () => {
                        await helpers.tzip7.setPause(false);
                    });
                    expect(await helpers.tzip7.getPauseState()).to.be.false;

                    await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                        await helpers.tzip7.setPause(true);
                    });
                    expect(await helpers.tzip7.getPauseState()).to.be.true;

                    const operationPromise = _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
                        await helpers.tzip7.setPause(false);
                    });
                    await expect(operationPromise).to.be.eventually.rejected
                        .and.be.instanceOf(TezosOperationError)
                        .and.have.property('message', contractErrors.tzip7.senderIsNotAdmin);
                    expect(await helpers.tzip7.getPauseState()).to.be.true;

                    await _taquitoHelpers.signAs(admin.sk, async () => {
                        await helpers.tzip7.setPause(false);
                    });

                    expect(await helpers.tzip7.getPauseState()).to.be.false;
                });
            });
        });
    });
});
