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
    contract: "SimplePriceOracle",
    from: deployer,
    args: [],
  });
  console.log(`SimplePriceOracle deployed to ${priceOracle.address}`);
};
module.exports.tags = ["tOracle", "Test"];
// module.exports.dependencies = ["ERC20"];
