module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const delay = 2 * 24 * 60 * 60; // 2 days

  const timelock = await deploy("Timelock", {
    from: deployer,
    args: [deployer, delay],
  });
  console.log(`Timelock deployed to ${timelock.address}`);
};

module.exports.tags = ["Timelock"];
// module.exports.dependencies = ["Comptroller"];
