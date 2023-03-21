module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  // const { deploy } = deployments;
  // const { deployer } = await getNamedAccounts();

  const unitroller = await deployments.get("Unitroller");
  const UnitrollerUpg = await getContractAt("Comptroller", unitroller.address);

  const deprecatedCToken = "0x9fd31629bce28bd51fef2724f6a0d0e51bd549c2";
  const cToken = await getContractAt("CErc20Delegate", deprecatedCToken);

  let tx = await UnitrollerUpg._setCollateralFactor(deprecatedCToken, 0);
  await tx.wait();
  tx = await UnitrollerUpg._setBorrowPaused(deprecatedCToken, "true");
  await tx.wait();
  tx = await UnitrollerUpg._setMintPaused(deprecatedCToken, "true");
  await tx.wait();
  tx = await cToken._setReserveFactor("1000000000000000000");
  await tx.wait();

  console.log(`Token ${deprecatedCToken} was deactivated.`);
};

module.exports.tags = ["Deprecate"];
