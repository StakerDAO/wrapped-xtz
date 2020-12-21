![Delphi](https://github.com/stove-labs/wrapped-xtz/workflows/Delphi/badge.svg?branch=dev)

# Wrapped XTZ

## Dependencies

* Docker - used to run a local Tezos node together with the LIGO compiler (If you're on linux, follow the post-installation steps as well)
* Node.js - Javascript runtime environment that we'll use for testing and deployment
* LIGO - High level programming language for the Tezos blockchain
* truffle@tezos - Testing framework, originally built for Ethereum that now includes support for Tezos.
* ganache-cli@tezos - Part of the Truffle suite of blockchain development tools. It creates isolated sandboxes using Flextesa to automate reproducible tests with faster networks.
* jq - a lightweight CLI JSON processor.

## Getting started

### Install dependencies

Make sure to have [Docker](https://www.docker.com) running, [node.js](https://nodejs.org) and [jq](https://stedolan.github.io/jq/) installed.

```
npm i
npm run fix-ligo-version 0.5.0
```

### Starting Delphinet Sandbox

```
npm run sandbox:start
```

### Running tests

```
npm run test
# runs all tests and can take more than 1 hour

npm run test -- ./test/unit/bridge/lock.js
# runs a specific test

npm run test -- ./test/unit/bridge/**
# runs all tests in that folder
```
