// const hre = require("hardhat");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const stTon = await deploy("stTon", {
    contract: "StakedTON",
    from: deployer,
    args: ["StakedTON", "stTon"],
  });

  const pTon = await deploy("pTon", {
    contract: "PooledTON",
    from: deployer,
    args: ["PooledTON", "pTon", stTon.address],
  });

  console.log("stTon deployed at:", stTon.address);
  console.log("pTon deployed at:", pTon.address);
};

module.exports.tags = ["MockPTon", "Test"];
