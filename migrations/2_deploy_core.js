const core = artifacts.require('core');
const compileLambda = require('../scripts/lambdaCompiler/compileLambda');
const { UnitValue, MichelsonMap } = require('@taquito/taquito');
const testPackValue = require('../scripts/lambdaCompiler/testPackValue');
const { alice } = require('./../scripts/sandbox/accounts');
const saveContractAddress = require('../helpers/saveContractAddress');

module.exports = async (deployer, network, accounts) => {
    let lambdas = new MichelsonMap;
    let ovens = new MichelsonMap;
    let arbitraryValues = new MichelsonMap;

    arbitraryValues.set('wXTZTokenContractAddress', 
        testPackValue(
            `"${require('../deployments/tzip-7')}": address`
        )
    );

    arbitraryValues.set('admin', 
        testPackValue(
            `"${alice.pkh}": address`
        )
    );
    
    /**
     * Arbitrary lambdas
     */
    lambdas.set('arbitrary/composeBurnOperation',
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/arbitrary/composeBurnOperation/composeBurnOperation.religo'
        ).bytes
    );

    lambdas.set('arbitrary/composeMintOperation',
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/arbitrary/composeMintOperation/composeMintOperation.religo'
        ).bytes
    );

    lambdas.set('arbitrary/permissions/isAdmin',
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/arbitrary/permissions/isAdmin/isAdmin.religo'
        ).bytes
    );

    lambdas.set('arbitrary/permissions/isOvenOwner',
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/arbitrary/permissions/isOvenOwner/isOvenOwner.religo'
        ).bytes
    );

    lambdas.set('arbitrary/permissions/isTrustedOven',
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/arbitrary/permissions/isTrustedOven/isTrustedOven.religo '
        ).bytes
    );

    /**
     * Entrypoint lambdas
     */
    lambdas.set('updateLambdas', 
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/updateLambdas/updateLambdas.religo'
        ).bytes
    );

    lambdas.set('default', 
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/default/default.religo'
        ).bytes
    );

    lambdas.set('onOvenDepositReceived', 
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/onOvenDepositReceived/onOvenDepositReceived.religo'
        ).bytes
    );

    lambdas.set('onOvenWithdrawalRequested', 
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/onOvenWithdrawalRequested/onOvenWithdrawalRequested.religo'
        ).bytes
    );


    lambdas.set('onOvenSetDelegate', 
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/onOvenSetDelegate/onOvenSetDelegate.religo'
        ).bytes
    );

    /**
     * Compile the wXTZ Oven to Michelson so it can be included
     * within the `createOven` lambda
     */
    compileLambda(
        'contracts/partials/wxtz/core/lambdas/createOven/oven/oven.religo',
        'michelson.code',
        'contracts/partials/wxtz/core/lambdas/createOven/oven/oven.tz'
    );

    lambdas.set('createOven', 
        compileLambda(
            'contracts/partials/wxtz/core/lambdas/createOven/createOven.religo'
        ).bytes
    );

    const storage = {
        u: UnitValue,
        lambdas,
        ovens,
        arbitraryValues
    };

    deployer.deploy(core, storage)
        .then(contract => saveContractAddress('core', contract.address));
}