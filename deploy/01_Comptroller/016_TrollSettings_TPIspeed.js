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

  const cWETH = (await deployments.get("cWeth")).address;
  const cUsdc = (await deployments.get("cUSDC")).address;
  const cUsdt = (await deployments.get("cUSDT")).address;
  const cDai = (await deployments.get("cDAI")).address;
  const cWbtc = (await deployments.get("cWbtc")).address;
  const cpTon = (await deployments.get("cpTon")).address;

  const unitroller = await deployments.get("Unitroller");
  const UnitrollerUpg = await getContractAt("Comptroller", unitroller.address);

  const contracts = [cWETH, cUsdc, cUsdt, cDai, cWbtc, cpTon];

  console.log(`Adding TPI rewards for suppliers only.`);

  // 200M for 2 years for all 6 markets: 200M / 6 = 33_333_333 per market
  // 2years = 63072000 seconds = 5256000 blocks
  // 50M for each market: 25M for suppliers + 25M for borrowers
  // 2 years == 5256000 blocks
  // 33_333_333 / 5256000 = 6.3419583 * 1e18 per block
  // const supplySpeed = utils.parseUnits("6.3419583", 18);

  const supplySpeed = utils.parseUnits("6.3419583", 18);
  const supplySpeeds = [
    supplySpeed,
    supplySpeed,
    supplySpeed,
    supplySpeed,
    supplySpeed,
    supplySpeed,
  ];
  const borrowSpeeds = ["0", "0", "0", "0", "0", "0"];

  const tx = await UnitrollerUpg._setCompSpeeds(
    contracts,
    supplySpeeds,
    borrowSpeeds
  );
  await tx.wait();
  console.log("TPI speeds were set.");
};

module.exports.tags = ["TrollSet6"];
// module.exports.dependencies = ["Comptroller"];
