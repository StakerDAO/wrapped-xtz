const core = artifacts.require('core');
const compileLambda = require('../scripts/lambdaCompiler/compileLambda');
const { UnitValue, MichelsonMap } = require('@taquito/taquito');
const testPackValue = require('../scripts/lambdaCompiler/testPackValue');
const { alice } = require('./../scripts/sandbox/accounts');
const saveContractAddress = require('../helpers/saveContractAddress');
const lambdasList = require('./../lambdas');
const loadLambdaArtifact = require('./../scripts/lambdaCompiler/loadLambdaArtifact');
const initalStorage = require('./initialStorage/core');

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(core, initalStorage.base(
        require('./../deployments/tzip-7')
    ))
        .then(contract => saveContractAddress('core', contract.address));
}