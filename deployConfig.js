module.exports = {
  params: {
    // 011
    closeFactor: "500000000000000000", // 50%
    // 1.20 => (20% - reservesfee) incentive for liquidators
    liquidationIncentive: "1200000000000000000",
    // can be deployer (admin). set address:
    pauseGuardian: "0x0000000000000000000000000000000000000001",
    borrowCapGuardian: "0x0000000000000000000000000000000000000001",

    // 012 addresses
    // TPI: "0x0000000000000000000000000000000000000001",
    treasury: "0x0529CEa607586B33148B77c165f88362c9B00B11",
    gNft: "0x2e86fA4440d93b1BFfEa5cA673314ef54216D0a8",

    // 017
    collateralFactor: "500000000000000000", // 50%

    // rate models
    blocksPerYear: 2628000,
    kink: "800000000000000000",
    stableRM: {
      baseRatePerYear: "0",
      multiplierPerYear: "50000000000000000",
      jumpMultiplierPerYear: "1090000000000000000",
    },
    wethRM: {
      baseRatePerYear: "20000000000000000",
      multiplierPerYear: "225000000000000000",
      jumpMultiplierPerYear: "4900000000000000000",
    },
    wbtcRM: {
      baseRatePerYear: "20000000000000000",
      multiplierPerYear: "225000000000000000",
      jumpMultiplierPerYear: "1000000000000000000",
    },
    ptonRM: {
      baseRatePerYear: "50000000000000000", // 5%
      multiplierPerYear: "225000000000000000",
      jumpMultiplierPerYear: "5000000000000000000",
    },

    // tokens (needed for cTokens creating)
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    pTON: "0x6256aB9480B84Cf70d75773121C0523F87B0D588",

    // stTon address
    stTon: "0x0fB2E7c2d2754476aAa84762e44d3EE328AA9Ea2",

    // reserve factor 30% of income goes to reserves
    // set in cToken, can be different for each market
    reserveFactor: "300000000000000000",

    // price oracle
    twapPeriod: "1800", // 30 min
    baseAssetFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // weth chainlink pricefeed

    // https://docs.chain.link/data-feeds/price-feeds/addresses
    chainlink: {
      usdc: {
        feed: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
        decimals: 8,
        heartbeat: "86400",
      },
      usdt: {
        feed: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
        decimals: 8,
        heartbeat: "86400",
      },
      weth: {
        feed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        decimals: 8,
        heartbeat: "3600",
      },
      wbtc: {
        feed: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        decimals: 8,
        heartbeat: "3600",
      },
      dai: {
        feed: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
        decimals: 8,
        heartbeat: "3600",
      },
    },

    // pool addresses with high liquidity and observations
    poolTwap: {
      weth_usdc: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
      weth_usdt: "0x11b815efB8f581194ae79006d24E0d814B7697F6",
      weth_wbtc: "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD",
      weth_dai: "0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8",
      weth_pton: "0xe15E8c0d1e2C751f8a881E35FaE7f2037A4D20f4",
    },

    // cTokens
    // cWETH: "",
    // cUsdc: "",
    // cUsdt: "",
    // cDai: "",
    // cWbtc: "",
    // cpTon: "",
  },
};
