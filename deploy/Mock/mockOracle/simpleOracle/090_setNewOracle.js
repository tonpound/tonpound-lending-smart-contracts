module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const priceOracleDeployment = await deployments.get("TonpoundPriceOracle");
  console.log(`Setting new oracle ${priceOracleDeployment.address} ...`);

  const unitroller = await deployments.get("Unitroller");
  const UnitrollerUpg = await getContractAt("Comptroller", unitroller.address);

  const tx = await UnitrollerUpg._setPriceOracle(priceOracleDeployment.address);
  await tx.wait();
  console.log("Oracle updated");
};

module.exports.tags = ["UpdateOracle"];
// module.exports.dependencies = ["Oracle", "CERC", "CPTON"];
