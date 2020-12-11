const tzip7 = artifacts.require('tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));

const { alice, bob, carol, chuck, walter } = require('../../../scripts/sandbox/accounts');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const { contractErrors } = require('../../../helpers/constants');
const { TezosOperationError } = require('@taquito/taquito');

contract('TZIP-7 token contract %approveCAS entrypoint', () => {
    let helpers = {};
    const pauseGuardian = walter;
    const admin = alice;
    
    beforeEach(async () => {
        // deploy TZIP-7 instance with specific storage
        tzip7Instance = await tzip7.new(_tzip7InitialStorage.withApprovals);
        // display the current contract address for debugging purposes
        console.log('Originated token contract at:', tzip7Instance.address);

        await _taquitoHelpers.initialize();
        await _taquitoHelpers.setSigner(admin.sk);

        helpers.tzip7 = await _tzip7Helpers.at(tzip7Instance.address);
    });

    it('should change the allowance from zero to a non-zero value by calling %approveCAS', async () => {
        const allowance = 1000;
        const beforeApproveOperation = await helpers.tzip7.getAllowanceFromStorage(
            _tzip7InitialStorage.withApprovals, 
            carol.pkh, 
            bob.pkh
        );
        await _taquitoHelpers.setSigner(carol.sk); // owner

        await helpers.tzip7.approveCAS(
            beforeApproveOperation, // expected
            bob.pkh, // spender
            allowance
        );

        const afterApproveOperation = await helpers.tzip7.getAllowance(carol.pkh, bob.pkh);
        expect(beforeApproveOperation).to.equal(0);
        expect(afterApproveOperation).to.equal(allowance);
    });
    
    it('should change the allowance value from a non-zero value to zero using approveCAS', async () => {
        await _taquitoHelpers.setSigner(bob.sk); // owner
        const expectedValue = await helpers.tzip7.getAllowance(bob.pkh, carol.pkh);

        await helpers.tzip7.approveCAS(
            expectedValue,
            carol.pkh, // spender
            0 // new value
        );

        const beforeApproveOperation = await helpers.tzip7.getAllowanceFromStorage(
            _tzip7InitialStorage.withApprovals, // storage
            bob.pkh, // owner
            carol.pkh // spender
        );
        const afterApproveOperation = await helpers.tzip7.getAllowance(bob.pkh, carol.pkh);
        expect(beforeApproveOperation).to.not.equal(0);
        expect(afterApproveOperation).to.equal(0);
    });

    it('should change the allowance value from a non-zero value to a non-zero value using approveCAS', async () => {
        const beforeApproveCASOperation = await helpers.tzip7.getAllowance(bob.pkh, carol.pkh);
        const newValue = 10;
        await _taquitoHelpers.setSigner(bob.sk); // owner

        await helpers.tzip7.approveCAS(
            beforeApproveCASOperation, // expected
            carol.pkh, // spender
            newValue
        );
        const afterApproveCASOperation = await helpers.tzip7.getAllowance(bob.pkh, carol.pkh);
        expect(afterApproveCASOperation).to.equal(newValue);
    });

    it('should fail if the expected value does not match', async () => {
        const allowance = 1000;
        // current allowance is 0
        await _taquitoHelpers.setSigner(carol.sk); // owner

        const operationPromise = helpers.tzip7.approveCAS(
            10, // expected
            bob.pkh, // spender
            allowance
        );

        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.allowanceMismatch);
    });

    it('should fail if token operations are paused', async () => {
        // call %setPause with pause guardian
        await _taquitoHelpers.signAs(pauseGuardian.sk, async () => {
            await helpers.tzip7.setPause(true);
        });
        const beforeApproveCASOperation = await helpers.tzip7.getAllowance(bob.pkh, carol.pkh);
        await _taquitoHelpers.setSigner(bob.sk); // owner

        const operationPromise = helpers.tzip7.approveCAS(
            beforeApproveCASOperation, // expected
            carol.pkh, // spender
            1000 // allowance value
        );
        await expect(operationPromise).to.be.eventually.rejected
            .and.be.instanceOf(TezosOperationError)
            .and.have.property('message', contractErrors.tzip7.tokenOperationsPaused);
    });
});
