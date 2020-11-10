## Smart contracts



## wXTZ Core 

- `main/wxtz/core.religo`

wXTZ Core serves as the central piece of the wXTZ Platform, providing entrypoints and hooks for both end users and for other underlying smart contracts.

The core itself only implements two entrypoints directly - `%default` and `%runEntrypointLambda`.
In order for the business logic to be amendable over time, the core works with 'entrypoint lambdas' that can be invoked via the latter entrypoint.

### Lambdas

The core itself is built around upgradable/amendable lambdas, those are stored in a packed form (as bytes) in the core's storage. Lambdas can be of two types:
- Entrypoint lambdas
  ```reason
  type entrypointLambda = (bytes, storage, lambdaExtras) => (list(operation), storage);
  ```
- Arbitrary value lambdas
  ```reason
  type arbitraryValueLambda = ((bytes, storage)) => (list(operation), storage, bytes);
  ```

Entrypoint lambdas have a type signature of an entrypoint when unpacked and are meant to be called exclusively as entrypoints 'from the oustide world'.

Arbitrary value lambdas have an extra value in the return touple, allowing them to pass more data than just a list of operation and storage.

List of all lambdas is maintained in `lambdas.js` and used for migration & compilation purposes.


### Storage

```reason
type storage = {
    lambdas: big_map(string, bytes), // both entrypoint & arbitrary lambdas
    ovens: big_map(address, address), // oven, owner
    arbitraryValues: big_map(string, bytes) // arbitrary value storage
};
```

### Entrypoints

#### `%runEntrypointLambda`

Used to invoke lambdas that match the required entrypoint type signature.

##### Parameters
```reason
type runEntrypointLambdaParameter = {
    lambdaName: string, // name of the lambda to invoke
    lambdaParameter: bytes // packed parameters to be passed to the lambda
};
```

#### `%default`

Used as a fallback entrypoint to receive XTZ.

##### Parameters
```reason
type defaultParameter = unit;
```

### Entrypoint lambdas

#### `createOven`

Deploys a new wXTZ Oven on behalf of the specified `ovenOwner`. Automatically sets the delegate to the provided `delegate` and mints wXTZ according to the XTZ amount deposited.

##### Parameters
```reason
type createOvenParameter = {
    delegate: option(key_hash),
    ovenOwner: address 
};
```

##### Output operations
`wXTZToken%mint`

---
#### `onOvenDepositReceived`

##### Parameters
```reason
type onOvenDepositReceivedParameter = unit;
```

##### Output operations
`wXTZToken%mint`
`wXTZOven%default`

---
#### `onOvenWithdrawalRequested`

##### Parameters
```reason
type onOvenWithdrawalRequestedParameter = nat;
```

##### Output operations
`wXTZToken%burn`


## wXTZ Oven

- `partials/wxtz/core/lambdas/createOven/oven/oven.religo`

wXTZ Oven serves as a place to hold & manage locked XTZ of an oven owner. It's a smart-contract originated exclusively from the wXTZ Core, from oven source code stored with the core itself. Thanks to the before mentioned we can consider the oven 'trusted'.

Design goal here was to strip the oven of any significant responsibilities. Hence why the oven notifies the core of any action happening via a hook, so the core can apply it's amendable lambda logic as necessary.

### Storage

```reason
type ovenStorage = {
    coreAddress: address
};
```

### Entrypoints

#### `%default`

Used to receive top-ups or delegation rewards. Invokes the `%onOvenDepositReceived` core hook and transfers all the deposited XTZ to the core for subsequent processing.

> By default all the XTZ is returned back to the oven and is considered locked.

##### Parameters
```reason
type defaultParameter = unit;
```

##### Output operations
`wXTZCore%onOvenDepositReceived`

#### `%withdraw`

Used to withdraw locked XTZ in the wXTZ Oven. Invokes the `%onOvenWithdrawalRequested` core hook that is responsible for burning an equivalent amount of wXTZ.

##### Output operations
`wXTZCore%onOvenWithdrawalRequested`
`alice%default`

##### Parameters
```reason
type withdrawParameter = nat;
```


#### `%setDelegate`

Used to update the delegate of the given wXTZ Oven.

##### Parameters
```reason
type setDelegateParameter = option(key_hash);
```

## wXTZ Token (TZIP-7)

wXTZ Token extends the [TZIP-7](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-7/tzip-7.md) smart-contract standard with [Serokell's Bridge protocol/interface](https://github.com/StakerDAO/blend-on-tezos/blob/sashasashasasha151/sdao214-bridge-contract-clarification-and-fixes/contract/doc/specification.md#entrypoints). 

<!-- Add docs about pause guardian -->