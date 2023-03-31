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

  const unitroller = await deployments.get("Unitroller");
  const UnitrollerUpg = await getContractAt("Comptroller", unitroller.address);

  const cWETH = (await deployments.get("cWeth")).address;
  const cUsdc = (await deployments.get("cUSDC")).address;
  const cUsdt = (await deployments.get("cUSDT")).address;
  const cDai = (await deployments.get("cDAI")).address;
  const cWbtc = (await deployments.get("cWbtc")).address;
  const cpTon = (await deployments.get("cpTon")).address;

  // borrow caps in terms of underlying tokens
  const wethCap = utils.parseUnits("60", "18");
  const usdcCap = utils.parseUnits("100000", "6");
  const usdtCap = utils.parseUnits("100000", "6");
  const daiCap  = utils.parseUnits("100000", "18");
  const wbtcCap = utils.parseUnits("4", "8");
  const pTonCap = utils.parseUnits("40000", "9");

  const contracts = [cWETH, cUsdc, cUsdt, cDai, cWbtc, cpTon];
  const caps = [wethCap, usdcCap, usdtCap, daiCap, wbtcCap, pTonCap];

  console.log(`Adding borrow caps for markets.`);

  const tx = await UnitrollerUpg._setMarketBorrowCaps(contracts, caps);
  await tx.wait();

  console.log(`Caps added.`);
};

module.exports.tags = ["TrollSet7"];
// module.exports.dependencies = ["Comptroller"];
