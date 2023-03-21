module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const CompoundLens = await deploy("CompoundLens", {
    from: deployer,
  });
  console.log(`CompoundLens deployed to ${CompoundLens.address}`);
};

module.exports.tags = ["Lens"];
module.exports.dependencies = ["Comptroller"];
