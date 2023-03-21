module.exports = {
  params: {
    // 011
    closeFactor: "500000000000000000", // 50%
    // 1.10 => (10% - reservesfee) incentive for liquidators
    liquidationIncentive: "1100000000000000000",
    // can be deployer (admin)
    pauseGuardian: "0x03eE60B0De0d9b48C5A09E73c3fdF80fEB86AeEF",
    borrowCapGuardian: "0x03eE60B0De0d9b48C5A09E73c3fdF80fEB86AeEF",

    // 012
    TPI: "0x53a85c75E342840e36F972b6Fc909DE09cd415a5",
    treasury: "0x087200B15565fcFEEe8f2967EFF1fd5d4B9e5721",
    gNft: "0x3a487ddbC5d704D22EB3A1d9f345065744E10f3C",

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
      baseRatePerYear: "20000000000000000",
      multiplierPerYear: "225000000000000000",
      jumpMultiplierPerYear: "5000000000000000000",
    },

    // tokens (needed for cTokens creating)
    WETH: "0xbAb960249b6F939aF3B5FF56Fd68bDc2F7a6f37A",
    USDC: "0x91daD0894Feff018dEEA79852E7843076F2F97B5",
    USDT: "0x5e2Ff4B79D96A02de53d535FB3659484747cfF2b",
    DAI: "0x5D64Ab68538752236b3433D55B1275Ee61178153",
    WBTC: "0x55447e82d165eA75C0c319241800490856F43F38",
    pTON: "0x2Ea9B6B37D67a07556fAa734Df0bAe9Cd7712418",

    // stTon
    stTon: "0x9Ac34Ae030Af089A421FbB09cAbC48184B15FEEa",

    // reserve factor 25% of income goes to reserves
    // set in cToken, can be different for each market
    reserveFactor: "250000000000000000",

    // price oracle
    twapPeriod: "2700", // 45 min
    baseAssetFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", // weth chainlink pricefeed
    chainlink: {
      usdc: { feed: "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7", decimals: 8 },
      usdt: { feed: "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7", decimals: 8 }, // set for mainnet
      weth: { feed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", decimals: 8 },
      wbtc: { feed: "0xA39434A63A52E749F02807ae27335515BA4b07F7", decimals: 8 },
      dai: { feed: "0x0d79df66BE487753B02D015Fb622DED7f0E9798d", decimals: 8 },
    },
    poolTwap: {
      pton_ETH: "0xF5b5b107d0E5b23aBf2376b89fd6Ea25B44819A1",
    },

    // cTokens
    // cWETH: "0x021b5Fe8A05456319E48B3858DcAB4D65FedeA15",
    // cUsdc: "0x4A37D65B6809383e95E9D7cF5D4e453E3B666ED7",
    // cUsdt: "0xb526D566464fb1cd0f24F8A6D517d00039950213",
    // cDai: "0xC74B568DB2F22fa8170907faef863A86BfFe8e0e",
    // cWbtc: "0xAfbdd7541662d7F4cDe3a126212f781d2e97F743",
    // cpTon: "0xADD06D63b4737494AffF97055aF4BfF48C7A1FaB",
  },
};
