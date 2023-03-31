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

  const priceOracle = await deployments.get("TonpoundPriceOracle");
  const PriceOracle = await getContractAt(
    "TonpoundPriceOracle",
    priceOracle.address
  );

  const cWeth = (await deployments.get("cWeth")).address;
  const cUsdc = (await deployments.get("cUSDC")).address;
  const cUsdt = (await deployments.get("cUSDT")).address;
  const cWbtc = (await deployments.get("cWbtc")).address;
  const cDai = (await deployments.get("cDAI")).address;
  const cpTon = (await deployments.get("cpTon")).address;

  console.log(`Setting twap price feeds...`);

  // weth
  let tx = await PriceOracle.setTokenConfig(cWeth, params.poolTwap.weth_usdc);
  await tx.wait();

  // usdc (same pool as for cWeth)
  tx = await PriceOracle.setTokenConfig(cUsdc, params.poolTwap.weth_usdc);
  await tx.wait();

  // usdt
  tx = await PriceOracle.setTokenConfig(cUsdt, params.poolTwap.weth_usdt);
  await tx.wait();

  // wbtc
  tx = await PriceOracle.setTokenConfig(cWbtc, params.poolTwap.weth_wbtc);
  await tx.wait();

  // dai
  tx = await PriceOracle.setTokenConfig(cDai, params.poolTwap.weth_dai);
  await tx.wait();

  // pTon
  tx = await PriceOracle.setTokenConfig(cpTon, params.poolTwap.weth_pton);
  await tx.wait();

  console.log(`Oracle prices were set.`);
};

module.exports.tags = ["TwapOracle"];
module.exports.dependencies = ["TonPriceOracle"];
