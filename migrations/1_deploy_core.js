const core = artifacts.require('core');
const compileLambda = require('../scripts/lambdaCompiler/compileLambda');
const { UnitValue, MichelsonMap } = require('@taquito/taquito')

module.exports = async (deployer, network, accounts) => {
    let lambdas = new MichelsonMap;
    let ovens = new MichelsonMap;
    
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
    };

    deployer.deploy(core, storage);
}