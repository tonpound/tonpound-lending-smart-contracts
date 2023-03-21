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

  console.log(`Adding markets to Unitroller.`);

  let tx = await UnitrollerUpg._supportMarket(cWETH);
  await tx.wait();
  console.log(`Market ${cWETH} added`);

  tx = await UnitrollerUpg._supportMarket(cUsdc);
  await tx.wait();
  console.log(`Market ${cUsdc} added`);

  tx = await UnitrollerUpg._supportMarket(cUsdt);
  await tx.wait();
  console.log(`Market ${cUsdt} added`);

  tx = await UnitrollerUpg._supportMarket(cDai);
  await tx.wait();
  console.log(`Market ${cDai} added`);

  tx = await UnitrollerUpg._supportMarket(cWbtc);
  await tx.wait();
  console.log(`Market ${cWbtc} added`);

  tx = await UnitrollerUpg._supportMarket(cpTon);
  await tx.wait();
  console.log(`Market ${cpTon} added`);
  console.log(`Markets added.`);
};

module.exports.tags = ["TrollSet4", "Test"];
// module.exports.dependencies = ["Comptroller"];
