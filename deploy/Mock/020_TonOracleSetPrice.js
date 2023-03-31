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

  const twapPeriod = params.twapPeriod;
  const WETH = params.WETH;
  const baseUnderlying = WETH;
  const baseAssetFeed = params.baseAssetFeed;

  const priceOracle = (await deployments.get("TonpoundPriceOracle")).address;
  const PriceOracle = await getContractAt("TonpoundPriceOracle", priceOracle);

  const cpTON = (await deployments.get("cpTon")).address;

  console.log(`Setting twap price feeds...`);
  // TWAP config
  // uniswapV3 pool WETH-fakePTon 0x45f159c1199B48c4C64fE5a31e8D7A4C9Bf87370
  const uniswapMarket = params.poolTwap.pton_ETH; // goerli WETH-fakePTon
  const tx = await PriceOracle.setTokenConfig(cpTON, uniswapMarket);
  await tx.wait();

  console.log(`Oracle prices were set.`);
};

module.exports.tags = ["SetTwapConfig"];
// module.exports.dependencies = [""];
