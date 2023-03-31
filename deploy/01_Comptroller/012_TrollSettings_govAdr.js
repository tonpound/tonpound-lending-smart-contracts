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
  const UnitrollerUpg = await getContractAt("Comptroller", unitroller.address);

  ///  Setting PauseGuardian, BorrowCapGuardian
  const pauseGuardian = params.pauseGuardian;
  const borrowCapGuardian = params.borrowCapGuardian;

  console.log(`Setting comptroller PauseGuardian to`, pauseGuardian);
  let tx = await UnitrollerUpg._setPauseGuardian(pauseGuardian);
  await tx.wait();

  console.log(`Setting comptroller BorrowCapGuardian to`, borrowCapGuardian);
  tx = await UnitrollerUpg._setBorrowCapGuardian(borrowCapGuardian);
  await tx.wait();
  console.log(`Unitroller set PauseGuardian and BorrowCapGuardian`);

  /// TPI, treasury, gNFT
  const TPI = (await deployments.get("TPI")).address;
  const treasury = params.treasury;
  const gNft = params.gNft;

  console.log(`Setting TPI ${TPI} ...`);
  tx = await UnitrollerUpg._setCompAddress(TPI);
  await tx.wait();

  console.log(`Settong Treasury ${treasury} ...`);
  tx = await UnitrollerUpg._setTreasury(treasury);
  await tx.wait();

  console.log(`Setting gNFT ${gNft} ...`);
  tx = await UnitrollerUpg._setGNft(gNft);
  await tx.wait();
};

module.exports.tags = ["TrollSet2"];
// module.exports.dependencies = ["TrollSet1"];
