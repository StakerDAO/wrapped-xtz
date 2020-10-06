const { Tezos } = require('@taquito/taquito');
const args = process.argv.slice(2);

const data = JSON.parse(args[0]);
const type = JSON.parse(args[1]);

Tezos.rpc.packData({ data, type })
    .then(res => console.log(res.packed));