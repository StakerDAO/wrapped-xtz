const tzip7 = artifacts.require('tzip-7');
const { expect } = require('chai').use(require('chai-as-promised'));

const { alice, bob, chuck, trent, walter } = require('../../../scripts/sandbox/accounts');
const _tzip7InitialStorage = require('../../../migrations/initialStorage/tzip-7');
const _tzip7Helpers = require('../../helpers/tzip-7');
const _taquitoHelpers = require('../../helpers/taquito');
const { contractErrors } = require('../../../helpers/constants');
const { TezosOperationError } = require('@taquito/taquito');

contract('TZIP-7 token contract %setAdministrator entrypoint', () => {
    let helpers = {};
    const admin = alice;
    const newAdmin = trent; // trusted arbitrator
    const pauseGuardian = walter;
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

    describe('setAdministrator', () => {

        it('should be able to call %setAdminstrator by the admin', async () => {
            const operationPromise = helpers.tzip7.setAdministrator(newAdmin.pkh);
            await expect(operationPromise).to.be.eventually.fulfilled;
        });
    
        it('should fail to change admin by a third party', async () => {
            await _taquitoHelpers.setSigner(thirdParty.sk);
            
            const operationPromise = helpers.tzip7.setAdministrator(newAdmin.pkh);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.noPermission);
            // unchanged storage
            expect(await helpers.tzip7.getAdministrator()).to.equal(_tzip7InitialStorage.base.token.admin);
        });

        it('should fail to change admin by pause guardian', async () => {
            await _taquitoHelpers.setSigner(pauseGuardian.sk);
            
            const operationPromise = helpers.tzip7.setAdministrator(newAdmin.pkh);
            await expect(operationPromise).to.be.eventually.rejected
                .and.be.instanceOf(TezosOperationError)
                .and.have.property('message', contractErrors.tzip7.noPermission);
            // unchanged storage
            expect(await helpers.tzip7.getAdministrator()).to.equal(_tzip7InitialStorage.base.token.admin);
        });
        
        describe('effects of calling %setPauseGuardian', () => {
            
            beforeEach(async () => {
                await helpers.tzip7.setAdministrator(newAdmin.pkh);
            });

            it('should change the storage', async () => {
                expect(await helpers.tzip7.getAdministrator()).to.equal(newAdmin.pkh);
            });
        });       
    });
});

  
