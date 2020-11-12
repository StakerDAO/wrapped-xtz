const compileLambda = require('../../scripts/lambdaCompiler/compileLambda');
const { UnitValue, MichelsonMap } = require('@taquito/taquito');
const testPackValue = require('../../scripts/lambdaCompiler/testPackValue');
const { alice } = require('./../../scripts/sandbox/accounts');
const lambdasList = require('./../../lambdas');
const loadLambdaArtifact = require('./../../scripts/lambdaCompiler/loadLambdaArtifact');

const initialStorage = {};

initialStorage.base = (() => {
    let lambdas = new MichelsonMap;
    let ovens = new MichelsonMap;
    let arbitraryValues = new MichelsonMap;

    arbitraryValues.set('wXTZTokenContractAddress', 
        testPackValue(
            `"${require('../../deployments/tzip-7')}": address`
        )
    );

    arbitraryValues.set('admin', 
        testPackValue(
            `"${alice.pkh}": address`
        )
    );

    lambdasList.forEach(lambda => {
        if (lambda.migratable === false) return;
        // TODO: instead of `lambda.recompile` hash the lambda and recompile incrementally by itself
        let lambdaArtifact = loadLambdaArtifact(lambda.lambdaName, lambda.recompile);
        lambdas.set(lambda.lambdaAlias, lambdaArtifact.bytes);
    });

    return {
        lambdas,
        ovens,
        arbitraryValues,
    }
})();

module.exports = initialStorage;