const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // stable coins rate model
  const StableRateModelV2_0 = await deploy("StableRateModelV2", {
    contract: "JumpRateModelV2",
    from: deployer,
    args: [
      params.stableRM.baseRatePerYear,
      params.stableRM.multiplierPerYear,
      params.stableRM.jumpMultiplierPerYear,
      params.kink,
      deployer,
    ],
  });
  console.log(`StableRateModelV2 deployed to ${StableRateModelV2_0.address}`);

  // model 1
  // WETH
  const JumpRateModelV2_1 = await deploy("JumpRateModelV2_1", {
    contract: "JumpRateModelV2",
    from: deployer,
    args: [
      params.wethRM.baseRatePerYear,
      params.wethRM.multiplierPerYear,
      params.wethRM.jumpMultiplierPerYear,
      params.kink,
      deployer,
    ],
  });
  console.log(`JumpRateModelV2 deployed to ${JumpRateModelV2_1.address}`);

  // model 2
  // WBTC
  const JumpRateModelV2_2 = await deploy("JumpRateModelV2_2", {
    contract: "JumpRateModelV2",
    from: deployer,
    args: [
      params.wbtcRM.baseRatePerYear,
      params.wbtcRM.multiplierPerYear,
      params.wbtcRM.jumpMultiplierPerYear,
      params.kink,
      deployer,
    ],
  });
  console.log(`JumpRateModelV2 deployed to ${JumpRateModelV2_2.address}`);

  // model 3
  // pTon
  const JumpRateModelV2_3 = await deploy("JumpRateModelV2_3", {
    contract: "JumpRateModelV2",
    from: deployer,
    args: [
      params.ptonRM.baseRatePerYear,
      params.ptonRM.multiplierPerYear,
      params.ptonRM.jumpMultiplierPerYear,
      params.kink,
      deployer,
    ],
  });
  console.log(`JumpRateModelV2 deployed to ${JumpRateModelV2_3.address}`);
};

module.exports.tags = ["tRateModels", "Test"];
