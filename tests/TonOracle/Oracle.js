const { expect } = require("chai");
const {
  network,
  ethers: {
    provider,
    getContractAt,
    getSigners,
    utils: { parseEther, parseUnits, formatUnits, AbiCoder },
    constants: { MaxUint256, NegativeOne, WeiPerEther, AddressZero },
    BigNumber,
    getContractFactory,
  },
  deployments,
} = require("hardhat");

// const { BigNumber: BN } = require("bignumber.js");

async function getDeployedContract(deployedName, contractInterfaceName) {
  const contractDeployments = await deployments.get(deployedName);
  return await getContractAt(
    contractInterfaceName,
    contractDeployments.address
  );
}

const abiCoder = new AbiCoder();

// LIQUIDATION SCENARIO 2
describe("Tonpound Oracle", function () {
  let usdt, cUsdt, usdc, dai, cUsdc, wbtc, cWbtc, cDai, weth, cWeth;
  let time;
  let priceOracle;
  let deployer;
  let priceFeedEthUsd, priceFeedBtcUsd, priceFeedUsdcUsd;
  let factory;

  let snapshotIdBase;

  before(async function () {
    await deployments.fixture(["Test"]);
    [deployer] = await getSigners();

    usdt = await getDeployedContract("USDT", "ERC20MockToken");
    usdc = await getDeployedContract("USDC", "ERC20MockToken");
    wbtc = await getDeployedContract("WBTC", "ERC20MockToken");
    dai = await getDeployedContract("DAI", "ERC20MockToken");
    weth = await getDeployedContract("WETH", "ERC20MockToken");

    cUsdc = await getDeployedContract("cUSDC", "CErc20Immutable");
    cWbtc = await getDeployedContract("cWbtc", "CErc20Delegate");
    cUsdt = await getDeployedContract("cUSDT", "CErc20Delegate");
    cDai = await getDeployedContract("cDAI", "CErc20Delegate");
    cWeth = await getDeployedContract("cWeth", "CErc20Delegate");

    factory = await getContractAt(
      "IUniswapV3Factory",
      "0x1F98431c8aD98523631AE4a59f267346ea31F984"
    );

    // unitroller = await getDeployedContract("Unitroller", "Comptroller");

    const priceFeedF = await getContractFactory("MockPriceFeed");
    priceFeedEthUsd = await priceFeedF.deploy("ETH-USD", 8);
    priceFeedBtcUsd = await priceFeedF.deploy("BTC-USD", 8);
    priceFeedUsdcUsd = await priceFeedF.deploy("USDC-USD", 8);

    const twap = 1800;
    const baseUnderlying = weth.address;
    const baseAssetFeed = priceFeedEthUsd.address;
    const baseAssetHeartBeat = 1200;
    const priceOracleF = await getContractFactory("TonpoundPriceOracle");
    priceOracle = await priceOracleF.deploy(
      twap,
      baseUnderlying,
      baseAssetFeed,
      baseAssetHeartBeat
    );

    const btcHeartBeat = 1800;
    await priceOracle.setPriceFeedForUnderlying(
      wbtc.address,
      priceFeedBtcUsd.address,
      btcHeartBeat
    );
    await priceOracle.setPriceFeedForUnderlying(
      usdc.address,
      priceFeedUsdcUsd.address,
      btcHeartBeat
    );

    time = (await provider.getBlock("latest")).timestamp;
    console.log(time);
    await priceFeedEthUsd.setPriceFeedData("173514079858", time);
    await priceFeedBtcUsd.setPriceFeedData("2687833043967", time);
    await priceFeedUsdcUsd.setPriceFeedData("0", time);

    snapshotIdBase = await network.provider.request({
      method: "evm_snapshot",
      params: [],
    });
  });

  // ######################
  // Price oracle
  // ######################
  describe("TonpoundPriceOracle", function () {
    after(async function () {
      await network.provider.request({
        method: "evm_revert",
        params: [snapshotIdBase],
      });
    });

    it("Should return correct values from pricefeeds", async function () {
      const ethPrice = parseUnits("173514079858", 36 - 8 - 18);
      const btcPrice = parseUnits("2687833043967", 36 - 8 - 8);

      expect(ethPrice).equal(
        await priceOracle.getUnderlyingPrice(cWeth.address)
      );
      expect(btcPrice).equal(
        await priceOracle.getUnderlyingPrice(cWbtc.address)
      );
    });

    it("Should return zero prices if time expired and no twap configs", async function () {
      await provider.send("evm_increaseTime", [1801]);
      await provider.send("evm_mine");
      time = (await provider.getBlock("latest")).timestamp;

      expect(0).equal(await priceOracle.getUnderlyingPrice(cWeth.address));
      expect(0).equal(await priceOracle.getUnderlyingPrice(cWbtc.address));
    });

    it("Should return WETH price from twap after adding config", async function () {
      const poolFee = "500";
      const wethUsdcPool = await factory.getPool(
        weth.address,
        usdc.address,
        poolFee
      );
      const expectedLower = parseUnits("1730", 18);
      const expectedUpper = parseUnits("1760", 18);
      await priceOracle.setTokenConfig(cWeth.address, wethUsdcPool);
      const price = await priceOracle.getUnderlyingPrice(cWeth.address);
      expect(expectedLower).to.be.lt(price);
      expect(expectedUpper).to.be.gt(price);
    });

    it("Should return WBTC price from twap after adding config", async function () {
      const poolFee = "500";
      const wethWbtcPool = await factory.getPool(
        weth.address,
        wbtc.address,
        poolFee
      );
      const expectedLower = parseUnits("26500", 28);
      const expectedUpper = parseUnits("27100", 28);
      await priceOracle.setTokenConfig(cWbtc.address, wethWbtcPool);
      const price = await priceOracle.getUnderlyingPrice(cWbtc.address);
      console.log("price", price);
      expect(expectedLower).to.be.lt(price);
      expect(expectedUpper).to.be.gt(price);
    });

    it("Should return USDC price from twap after adding config", async function () {
      const poolFee = "500";
      const wethUsdcPool = await factory.getPool(
        weth.address,
        usdc.address,
        poolFee
      );
      const expectedLower = parseUnits("0.98", 30);
      const expectedUpper = parseUnits("1.02", 30);
      // const expectedPrice = ;
      await priceOracle.setTokenConfig(cUsdc.address, wethUsdcPool);
      const price = await priceOracle.getUnderlyingPrice(cUsdc.address);

      console.log("price", price);
      expect(expectedLower).to.be.lt(price);
      expect(expectedUpper).to.be.gt(price);
    });

    it("Should return prices from pricefeed after updating pricefeeds", async function () {
      time = (await provider.getBlock("latest")).timestamp;
      await provider.send("evm_increaseTime", [354]);
      await provider.send("evm_mine");

      const rawWeth = "173514079789";
      const rawWbtc = "2687833043444";
      const rawUsdc = "99980000";
      await priceFeedEthUsd.setPriceFeedData(rawWeth, time);
      await priceFeedBtcUsd.setPriceFeedData(rawWbtc, time);
      await priceFeedUsdcUsd.setPriceFeedData(rawUsdc, time);

      const ethPrice = parseUnits(rawWeth, 36 - 8 - 18);
      const btcPrice = parseUnits(rawWbtc, 36 - 8 - 8);
      const usdcPrice = parseUnits(rawUsdc, 36 - 8 - 6);

      expect(ethPrice).equal(
        await priceOracle.getUnderlyingPrice(cWeth.address)
      );
      expect(btcPrice).equal(
        await priceOracle.getUnderlyingPrice(cWbtc.address)
      );
      expect(usdcPrice).equal(
        await priceOracle.getUnderlyingPrice(cUsdc.address)
      );
    });

    it("Unable to set incorrect config", async function () {
      const poolFee = "500";
      const wethWbtcPool = await factory.getPool(
        weth.address,
        wbtc.address,
        poolFee
      );
      await expect(
        priceOracle.setTokenConfig(cUsdc.address, wethWbtcPool)
      ).to.be.revertedWith(
        `InvalidMarket("${wethWbtcPool}", "${usdc.address}")`
      );
    });
  });
});
