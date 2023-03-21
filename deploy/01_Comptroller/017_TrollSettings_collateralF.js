const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils, provider },
}) => {
  // const { deploy } = deployments;
  // const { deployer } = await getNamedAccounts();

  const unitroller = await deployments.get("Unitroller");
  const UnitrollerUpg = await getContractAt("Comptroller", unitroller.address);

  const cWETH = (await deployments.get("cWeth")).address;
  const cUsdc = (await deployments.get("cUSDC")).address;
  const cUsdt = (await deployments.get("cUSDT")).address;
  const cDai = (await deployments.get("cDAI")).address;
  const cWbtc = (await deployments.get("cWbtc")).address;
  const cpTon = (await deployments.get("cpTon")).address;

  console.log(`Setting collateral factor for markets.`);
  let tx = await UnitrollerUpg._setCollateralFactor(
    cWETH,
    params.collateralFactor
  );
  await tx.wait();

  tx = await UnitrollerUpg._setCollateralFactor(cUsdc, params.collateralFactor);
  await tx.wait();

  tx = await UnitrollerUpg._setCollateralFactor(cUsdt, params.collateralFactor);
  await tx.wait();

  tx = await UnitrollerUpg._setCollateralFactor(cDai, params.collateralFactor);
  await tx.wait();

  tx = await UnitrollerUpg._setCollateralFactor(cWbtc, params.collateralFactor);
  await tx.wait();

  tx = await UnitrollerUpg._setCollateralFactor(cpTon, params.collateralFactor);
  await tx.wait();
  console.log(`Done`);
};

module.exports.tags = ["TrollSet7", "Test"];
// module.exports.dependencies = ["TonPriceOracle"];
