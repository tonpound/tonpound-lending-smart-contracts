module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const twap = await deploy("MockTwap", {
    contract: "MockTwap",
    from: deployer,
    args: [],
  });
  console.log(`SimplePriceOracle deployed to ${twap.address}`);

  const TWAP = await getContractAt("MockTwap", twap.address);

  const market = "0x11b815efB8f581194ae79006d24E0d814B7697F6"; // eth usdt
  const marketBTC_ETH = "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD";
  const marketAAVE_ETH = "0x5aB53EE1d50eeF2C1DD3d5402789cd27bB52c1bB";
  const reserved = "false";
  const anchorPeriod = 1800;

  let price = await TWAP.getUniswapTwap(market, reserved, anchorPeriod);
  console.log("PRICE:", price);

  price = await TWAP.getUniswapTwap(marketBTC_ETH, "true", anchorPeriod);
  console.log("PRICE:", price);

  price = await TWAP.getUniswapTwap(marketAAVE_ETH, "true", anchorPeriod);
  console.log("PRICE:", price);
};
module.exports.tags = ["Twap"];
// module.exports.dependencies = ["ERC20"];
