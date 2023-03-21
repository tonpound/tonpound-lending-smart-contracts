const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  // const { deploy } = deployments;
  // const { deployer } = await getNamedAccounts();

  /// Setting PauseGuardian, BorrowCapGuardian, CloseFactor

  const closeFactor = params.closeFactor; // 50%

  // 1.10 => (10% - reservesfee) incentive for liquidators
  const liquidationIncentive = params.liquidationIncentive;
  const pauseGuardian = params.pauseGuardian;
  const borrowCapGuardian = params.borrowCapGuardian;

  // const comptroller = await deployments.get("Comptroller");
  const unitroller = await deployments.get("Unitroller");
  const Unitroller = await getContractAt("Comptroller", unitroller.address);

  console.log(`Setting comptroller PauseGuardian to`, pauseGuardian);
  let tx = await Unitroller._setPauseGuardian(pauseGuardian);
  await tx.wait();

  console.log(`Setting comptroller BorrowCapGuardian to`, borrowCapGuardian);
  tx = await Unitroller._setBorrowCapGuardian(borrowCapGuardian);
  await tx.wait();
  console.log(`Unitroller set PauseGuardian and BorrowCapGuardian`);

  console.log(`Setting comptroller CloseFactor to`, closeFactor);
  tx = await Unitroller._setCloseFactor(closeFactor);
  await tx.wait();
  console.log("Unitroller set close factor to", closeFactor);

  console.log(
    "Setting comptroller liquidationIncentive to",
    liquidationIncentive
  );
  tx = await Unitroller._setLiquidationIncentive(liquidationIncentive);
  await tx.wait();
  console.log(
    `Unitroller set LiquidationIncentive to ${liquidationIncentive}.`
  );
};

module.exports.tags = ["TrollSet1", "Test"];
// module.exports.dependencies = ["Comptroller"];
