const getViews = artifacts.require('getViews');
const { UnitValue } = require('@taquito/taquito');
const saveContractAddress = require('./../helpers/saveContractAddress');

const initialStorage = {
  balance: 0,
  allowance: 0,
  totalSupply: 0,
  outcome: "",
  swap: {
      confirmed: false,
      fee: 0,
      from: "tz1Stov6vkHPAGQNo2iUWYQwZpqAtceMTsUe",
      releaseTime: "2020-01-01T01:01:01.000Z",
      to: "tz1Stov6vkHPAGQNo2iUWYQwZpqAtceMTsUe",
      value: 0,
  },
  u: UnitValue,
};

module.exports = async (deployer, network, accounts) => {
    if (network == 'mainnet') {
        return;
    } else {
        deployer.deploy(getViews, initialStorage)
        .then(contract => saveContractAddress('getViews', contract.address));
    };
};
module.exports.initialStorage = initialStorage;
