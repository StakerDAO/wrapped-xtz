const compileLambda = require('../../scripts/lambdaCompiler/compileLambda');
const { UnitValue, MichelsonMap } = require('@taquito/taquito');
const testPackValue = require('../../scripts/lambdaCompiler/testPackValue');
const { alice, carol } = require('./../../scripts/sandbox/accounts');
const lambdasList = require('./../../lambdas');
const loadLambdaArtifact = require('./../../scripts/lambdaCompiler/loadLambdaArtifact');
const generateAddress = require('./../../helpers/generateAddress');
const compileLambdaAsArtifact = require('../../scripts/lambdaCompiler/compileLambdaAsArtifact');

const initialStorage = {};

initialStorage.base = (tzip7Address) => {
    let lambdas = new MichelsonMap;
    let ovens = new MichelsonMap;
    let arbitraryValues = new MichelsonMap;

    arbitraryValues.set('wXTZTokenContractAddress', 
        testPackValue(
            `"${tzip7Address}": address`
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
};

initialStorage.test = {};
initialStorage.test.base = () => {
    let mockTzip7Address = generateAddress();
    let storage = initialStorage.base(mockTzip7Address);
    return storage;
};

initialStorage.test.runEntrypointLambda = () => {
    let storage = initialStorage.test.base();

    storage.lambdas.set(
        'entrypoint/nonEntrypointLambda', 
        storage.lambdas.get('arbitrary/permissions/isAdmin')
    );

    storage.lambdas.set(
        'entrypoint/simpleEntrypointLambda',
        loadLambdaArtifact(
            'contracts/partials/wxtz/core/test/runEntrypointLambda/simpleEntrypointLambda.religo',
            false
        ).bytes
    )

    storage.ovens.set(
        // alice owns a mock oven with the same pkh as alice
        alice.pkh, alice.pkh
    );

    return storage;
};

initialStorage.test.createOven = (tzip7Address) => {
    let storage = initialStorage.base(tzip7Address);
    return storage;
};
initialStorage.test.onOvenDepositReceived = (ovens) => (tzip7Address) => {
    let storage = initialStorage.base(tzip7Address);

    // alice's pkh is registred as an oven
    storage.ovens.set(alice.pkh, carol.pkh);

    ovens.forEach(ovenAndOwner => {
        storage.ovens.set(ovenAndOwner.oven, ovenAndOwner.owner);
    })
  
    return storage;
};

initialStorage.test.onOvenWithdrawalRequested = (tzip7Address) => {
    let storage = initialStorage.base(tzip7Address);
    storage.ovens.set(
        // alice owns a mock oven with the same pkh as alice
        alice.pkh, alice.pkh
    );
    return storage;
};

initialStorage.test.onOvenSetDelegate = () => {
    let storage = initialStorage.test.base();
    storage.ovens.set(
        // alice owns a mock oven with the same pkh as alice
        alice.pkh, alice.pkh
    );
    return storage;
};

module.exports = initialStorage;