const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('PollContractModule', (m) => {
  const pollContract = m.contract('PollContract');
  return { pollContract };
});
