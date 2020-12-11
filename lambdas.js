module.exports = [
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/arbitrary/composeBurnOperation/composeBurnOperation.religo',
        lambdaAlias: 'arbitrary/composeBurnOperation',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/arbitrary/composeMintOperation/composeMintOperation.religo',
        lambdaAlias: 'arbitrary/composeMintOperation',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/arbitrary/permissions/isAdmin/isAdmin.religo',
        lambdaAlias: 'arbitrary/permissions/isAdmin',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/arbitrary/permissions/isOvenOwner/isOvenOwner.religo',
        lambdaAlias: 'arbitrary/permissions/isOvenOwner',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/arbitrary/permissions/isTrustedOven/isTrustedOven.religo',
        lambdaAlias: 'arbitrary/permissions/isTrustedOven',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/updateLambdas/updateLambdas.religo',
        lambdaAlias: 'entrypoint/updateLambdas',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/default/default.religo',
        lambdaAlias: 'entrypoint/default',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/onOvenDepositReceived/onOvenDepositReceived.religo',
        lambdaAlias: 'entrypoint/onOvenDepositReceived',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/onOvenWithdrawalRequested/onOvenWithdrawalRequested.religo',
        lambdaAlias: 'entrypoint/onOvenWithdrawalRequested',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/onOvenSetDelegate/onOvenSetDelegate.religo',
        lambdaAlias: 'entrypoint/onOvenSetDelegate',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/createOven/oven/oven.religo',
        selectFromJSONOutput: 'michelson.code',
        saveToFile: 'contracts/partials/wxtz/core/lambdas/createOven/oven/oven.tz',
        migratable: false // this lambda is not includable in the core storage
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/createOven/createOven.religo',
        lambdaAlias: 'entrypoint/createOven',
    },
    {
        lambdaName: 'contracts/partials/wxtz/core/lambdas/setArbitraryValue/setArbitraryValue.religo',
        lambdaAlias: 'entrypoint/setArbitraryValue'
    }
]