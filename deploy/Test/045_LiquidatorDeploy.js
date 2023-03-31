const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils, constants, provider },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const liquidator = await deploy("Liquidator", {
    contract: "Liquidator",
    from: deployer,
    args: [],
  });
  console.log("Liquidator:", liquidator.address);
};

module.exports.tags = ["Liquidator"];
// module.exports.dependencies = ["tCreatePool"];
