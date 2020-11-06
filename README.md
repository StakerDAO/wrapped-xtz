# Wrapped XTZ

```
npm install
```

## Starting Carthage Sandbox

```
npm run sandbox:start
```

## Migrating contracts to localhost:8732

Please note that core migration script is deactivated on this branch.

```
npm run migrate
```

## Testing Token and Bridge Contracts

```
npm run test -- ./test/token/tzip-7.js
npm run test -- ./test/token/bridge.js
```

## Compiling TZIP-7 Ligo contract to Michelson

```
docker run -v $PWD:/usr/project --rm -i ligolang/ligo:next compile-contract ./usr/project/contracts/main/wxtz/tzip-7.religo main
```