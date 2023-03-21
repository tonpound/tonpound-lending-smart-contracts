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

  const priceOracle = await deploy("TonpoundPriceOracle", {
    contract: "TonpoundPriceOracle",
    from: deployer,
    args: [twapPeriod, baseUnderlying, baseAssetFeed],
  });
  console.log(`TonpoundPriceOracle deployed to ${priceOracle.address}`);

  const PriceOracle = await getContractAt(
    "TonpoundPriceOracle",
    priceOracle.address
  );

  // const cWETH = params.cWETH;
  // const cUsdc = params.cUsdc;
  // const cUsdt = params.cUsdt;
  // const cDai = params.cDai;
  // const cWbtc = params.cWbtc;
  const cpTON = (await deployments.get("cpTon")).address;

  const USDC = params.USDC;
  const USDT = params.USDT;
  const WBTC = params.WBTC;
  const DAI = params.DAI;
  const pTon = params.pTON;

  console.log(`Setting oracle price feeds...`);
  // set chainlink price feeds for the assets
  // USDC
  let tx = await PriceOracle._setPriceFeedForUnderlying(
    USDC,
    params.chainlink.usdc.feed,
    params.chainlink.usdc.decimals
  );
  await tx.wait();

  // USDT
  tx = await PriceOracle._setPriceFeedForUnderlying(
    USDT,
    params.chainlink.usdt.feed,
    params.chainlink.usdt.decimals
  );
  await tx.wait();

  // DAI
  tx = await PriceOracle._setPriceFeedForUnderlying(
    DAI,
    params.chainlink.dai.feed,
    params.chainlink.dai.decimals
  );
  await tx.wait();

  // WBTC
  tx = await PriceOracle._setPriceFeedForUnderlying(
    WBTC,
    params.chainlink.wbtc.feed,
    params.chainlink.wbtc.decimals
  );
  await tx.wait();

  // WETH
  tx = await PriceOracle._setPriceFeedForUnderlying(
    WETH,
    params.chainlink.weth.feed,
    params.chainlink.weth.decimals
  );
  await tx.wait();

  console.log(`Setting twap price feeds...`);
  // TWAP config
  // uniswapV3 pool WETH-fakePTon 0x45f159c1199B48c4C64fE5a31e8D7A4C9Bf87370
  const uniswapMarket = params.poolTwap.pton_ETH; // goerli WETH-fakePTon
  tx = await PriceOracle.setTokenConfig(cpTON, uniswapMarket);
  await tx.wait();

  console.log(`Oracle prices were set.`);
};

module.exports.tags = ["TonPriceOracle", "Test"];
// module.exports.dependencies = [""];
