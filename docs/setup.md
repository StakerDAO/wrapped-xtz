# Setup
In order to get started pull the current git repository first:

```bash
git pull https://github.com/stove-labs/wrapped-xtz && cd wrapped-xtz
```

### Operating system

It's recommended to run this project on unix-like operating systems, preferably MAC OS.
The underlying toolchain should work without issues on Linux, however it has not been thoroughly tested
on various distributions.

### Install dependencies

- [NPM](https://www.npmjs.com/get-npm)
- [Docker](https://docs.docker.com/get-docker/)
- [LIGO](https://ligolang.org/docs/intro/installation#dockerized-installation-recommended) *(Dockerized version required)*

#### Install NPM dependencies

```bash
npm install
```

> This project relies on a specific version of the ligo compiler, as of writing the latest release is *0.3.0*. wXTZ smart-contracts may not compile under a different/newer version of LIGO.

After pulling the repository & installing the dependencies listed above you can verify your setup by running the following set of commands:

```bash
# Set the correct compiler version
npm run fix-ligo-version -- 0.3.0
# Compile the contracts & lambdas
npm run compile
```

#### Project structure

Following tree structure is an approximate overview of the file & folder structure of this project.

```
// all smart-contract source files
├── contracts 
    // concrete smart-contracts to compile
│   ├── main
│   │   └── wxtz
    // composable smart-contract snippets
│   └── partials
│       └── wxtz
            // partials for the wXTZ Core
│           ├── core
│           │   ├── arbitraryValues
│           │   ├── default
│           │   ├── helpers
│           │   ├── lambdas
│           │   ├── mockLambdaContracts
│           │   ├── parameter
│           │   ├── runArbitraryValueLambda
│           │   ├── runEntrypointLambda
│           │   └── storage
            // partials used for testing purposes of the TZIP-7 contract
│           ├── getViews
            // partials for the wXTZ TZIP-7 contract
│           └── tzip7
// Addresses of the latest migrated contracts
├── deployments
// Documentation
├── docs
// General purpose helper scripts
├── helpers
// Migration/deployment scripts including initial storage definitions
├── migrations
// Toolchain scripts
├── scripts
│   ├── lambdaCompiler
│   ├── sandbox
│   └── tools
// Smart-contract tests
└── test
```