const core = artifacts.require('core');
const compileLambda = require('../scripts/lambdaCompiler/compileLambda');
const { UnitValue, MichelsonMap } = require('@taquito/taquito')

module.exports = async (deployer, network, accounts) => {
    let lambdas = new MichelsonMap;
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

    const storage = {
        u: UnitValue,
        lambdas
    }
    deployer.deploy(core, storage);
}