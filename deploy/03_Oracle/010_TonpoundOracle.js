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
  const baseAssetHeartBeat = params.chainlink.weth.heartbeat;

  const priceOracle = await deploy("TonpoundPriceOracle", {
    contract: "TonpoundPriceOracle",
    from: deployer,
    args: [twapPeriod, baseUnderlying, baseAssetFeed, baseAssetHeartBeat],
  });
  console.log(`TonpoundPriceOracle deployed to ${priceOracle.address}`);

  const PriceOracle = await getContractAt(
    "TonpoundPriceOracle",
    priceOracle.address
  );

  const USDC = params.USDC;
  const USDT = params.USDT;
  const WBTC = params.WBTC;
  const DAI = params.DAI;
  const pTon = params.pTON;

  console.log(`Setting oracle price feeds...`);
  // set chainlink price feeds for the assets
  // USDC
  const underlyings = [USDC, USDT, DAI, WBTC];
  const priceFeeds = [
    params.chainlink.usdc.feed,
    params.chainlink.usdt.feed,
    params.chainlink.dai.feed,
    params.chainlink.wbtc.feed,
  ];
  const heartbeats = [
    params.chainlink.usdc.heartbeat,
    params.chainlink.usdt.heartbeat,
    params.chainlink.dai.heartbeat,
    params.chainlink.wbtc.heartbeat,
  ];
  const tx = await PriceOracle.setPriceFeedsForUnderlyings(
    underlyings,
    priceFeeds,
    heartbeats
  );
  await tx.wait();

  console.log(`Oracle prices were set.`);
};

module.exports.tags = ["TonPriceOracle"];
// module.exports.dependencies = [""];
