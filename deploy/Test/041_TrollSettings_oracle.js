const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils, provider },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const unitroller = await deployments.get("Unitroller");
  const Unitroller = await getContractAt("Comptroller", unitroller.address);

  const priceOracle = (await deployments.get("PriceOracle")).address;

  console.log("Setting Oracle: ", priceOracle);
  const tx = await Unitroller._setPriceOracle(priceOracle);
  await tx.wait();
};

module.exports.tags = ["tTrollSet3", "Test"];
module.exports.dependencies = ["tComptroller", "tOracle"];
