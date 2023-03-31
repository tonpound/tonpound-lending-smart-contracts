const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  // reserve factor scaled by 1e18
  // "200000000000000000" means 20% of income goes to reserves
  const reserveFactorMantissa = params.reserveFactor;

  const cUsdc = await deployments.get("cUSDC");
  const cUsdt = await deployments.get("cUSDT");
  const cDai = await deployments.get("cDAI");
  const cWeth = await deployments.get("cWeth");
  const cWbtc = await deployments.get("cWbtc");

  const cUsdcContract = await getContractAt("CErc20Delegate", cUsdc.address);
  let tx = await cUsdcContract._setReserveFactor(reserveFactorMantissa);
  await tx.wait();

  const cUsdtContract = await getContractAt("CErc20Delegate", cUsdt.address);
  tx = await cUsdtContract._setReserveFactor(reserveFactorMantissa);
  await tx.wait();

  const cDaiContract = await getContractAt("CErc20Delegate", cDai.address);
  tx = await cDaiContract._setReserveFactor(reserveFactorMantissa);
  await tx.wait();

  const cWethContract = await getContractAt("CErc20Delegate", cWeth.address);
  tx = await cWethContract._setReserveFactor(reserveFactorMantissa);
  await tx.wait();

  const cWbtcContract = await getContractAt("CErc20Delegate", cWbtc.address);
  tx = await cWbtcContract._setReserveFactor(reserveFactorMantissa);
  await tx.wait();

  console.log(`Reserve factor ${reserveFactorMantissa} was set.`);
};

module.exports.tags = ["tReserveFactor", "Test"];
module.exports.dependencies = ["tCERC"];
