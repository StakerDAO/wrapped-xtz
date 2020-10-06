const core = artifacts.require('core');
const compileLambda = require('../helpers/compileLambda');
const { UnitValue, MichelsonMap } = require('@taquito/taquito')

module.exports = async (deployer, network, accounts) => {
    const updateLambdas = compileLambda(
        'contracts/partials/wxtz/core/lambdas/updateLambdas/updateLambdas.religo'
    );
    
    let lambdas = new MichelsonMap;
    lambdas.set('updateLambdas', updateLambdas.bytes);

    const storage = {
        u: UnitValue,
        lambdas
    }
    deployer.deploy(core, storage);
}