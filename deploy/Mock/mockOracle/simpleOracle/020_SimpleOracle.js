module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const priceOracle = await deploy("PriceOracle", {
    contract: "SimplePriceOracleV2",
    from: deployer,
    args: [],
  });
  console.log(`SimplePriceOracle deployed to ${priceOracle.address}`);
};
module.exports.tags = ["Oracle", "Test"];
// module.exports.dependencies = ["ERC20"];
