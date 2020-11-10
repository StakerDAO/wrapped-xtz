# CLI

You can find a range of useful commands in the `script` section of [`package.json`](../package.json). 
All of the commands can be run as follows:

```
npm run command-name-goes-here -- extra-arguments-go-here
```

### Commands

|Command|Description
|:----|:----
|**Clean**|-
|`clean` | Cleans contract build artifacts
|`clean:all` | Cleans contract & lambda build artifacts
|**Test**|-
|`test`| Runs the full test-suite
|`test -- test-suite-file-name.js`| Runs a specific test suite
|`test:clean`| Runs clean before running the full test-suite
|`test:watch`| Runs the full test-suite everytime a source file changes
|**Compile**|-
|`compile`| Compiles all contracts and lambdas
|`compile:clean`| Runs clean before compiling all contracts and lambdas
|`compile:watch` | Compiles all contracts and lambdas everytime a source file changes
|`compile:lambda -- ./lambda-file-path.religo`| Compiles the given lambda
|`compile:lambda:watch -- ./lambda-file-path.religo`| Compiles the given lambda every time a soruce file changes 
|`compile:lambdas-all`| Compile all lambdas
|**Migrate**|-
|`migrate`| Migrates smart-contracts using the migration scripts
|`migrate:clean`| Cleans before migrating
|`migrate:watch`| Runs migrate everytime a source file changes
|**Tools**|-
|`tools:init -- tool-name`| Initializes the specified tool
|`tools:start -- tool-name`| Starts the specified tool
|`tools:kill/update/clean/restart -- tool-name`| Additional commands to work with tools
|**Miscellaneous**|-
|`sandbox:start`| Starts a sandbox with a predefined Tezos protocol
|`fix-ligo-version -- ligo-version-number-or-tag`| Aliases the ligo docker version
