const { expect } = require("chai");
const {
  network,
  ethers: {
    provider,
    getContractAt,
    getSigners,
    utils: { parseEther, formatUnits, AbiCoder },
    constants: { MaxUint256, NegativeOne, WeiPerEther, AddressZero },
    BigNumber,
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
describe("LIQUIDATION SCENARIO 1", function () {
  let usdt, cUsdt, usdc, cUsdc, wbtc, cWbtc;
  let pTon, stTon, cpTon;
  let unitroller, priceOracle;
  let deployer, user1, user2;

  let snapshotIdBase;

  before(async function () {
    await deployments.fixture(["Test"]);
    [deployer, user1, user2] = await getSigners();

    usdt = await getDeployedContract("USDT", "ERC20MockToken");
    usdc = await getDeployedContract("USDC", "ERC20MockToken");
    wbtc = await getDeployedContract("WBTC", "ERC20MockToken");

    cUsdc = await getDeployedContract("cUSDC", "CErc20Immutable");
    cWbtc = await getDeployedContract("cWbtc", "CErc20Delegate");
    cUsdt = await getDeployedContract("cUSDT", "CErc20Delegate");

    stTon = await getDeployedContract("stTon", "StakedTON");
    pTon = await getDeployedContract("pTon", "PooledTON");
    cpTon = await getDeployedContract("cpTon", "CpTonDelegate");
    unitroller = await getDeployedContract("Unitroller", "Comptroller");
    priceOracle = await getDeployedContract("PriceOracle", "SimplePriceOracle");

    // initial mints
    const userInitBalance = parseEther("100000");
    [usdt, usdc, wbtc, stTon].forEach(async (token) => {
      await token.mint(deployer.address, userInitBalance);
      await token.mint(user1.address, userInitBalance);
      await token.mint(user2.address, userInitBalance);
    });
    // approvals
    [deployer, user1, user2].forEach(async (user) => {
      await usdt.connect(user).approve(cUsdt.address, userInitBalance);
      await usdc.connect(user).approve(cUsdc.address, userInitBalance);
      await wbtc.connect(user).approve(cWbtc.address, userInitBalance);
      await pTon.connect(user).approve(cpTon.address, userInitBalance);
      await stTon.connect(user).approve(cpTon.address, userInitBalance);
    });

    await priceOracle.setUnderlyingPrice(cWbtc.address, parseEther("20000"));
    // set wbtc collateral factor 25%
    await unitroller._setCollateralFactor(cWbtc.address, parseEther("0.25"));
    await unitroller._setCollateralFactor(cUsdt.address, parseEther("0.50"));

    snapshotIdBase = await network.provider.request({
      method: "evm_snapshot",
      params: [],
    });
  });

  // ######################
  // LIQUIDATION SCENARIO 1
  // ######################
  describe("Liquidation scenario 1", function () {
    after(async function () {
      await network.provider.request({
        method: "evm_revert",
        params: [snapshotIdBase],
      });
    });

    it("Should return correct initial balance and approvals", async function () {
      const initBalance = parseEther("100000");
      const user1Bal = await usdt.balanceOf(user1.address);
      const user2Bal = await wbtc.balanceOf(user2.address);

      const user1Apr = await usdc.allowance(user1.address, cUsdc.address);
      const user2Apr = await usdt.allowance(user2.address, cUsdt.address);

      const user1Apr2 = await wbtc.allowance(user1.address, cWbtc.address);


      expect(initBalance).equal(user1Bal).equal(user2Bal);
      expect(initBalance).equal(user1Apr).equal(user2Apr).equal(user1Apr2);
    });

    it("user1 mints 1 WBTC and deployer mints 10000 USDC", async function () {
      const mintAmount = parseEther("1");
      await cWbtc.connect(user1).mint(mintAmount);
      const mintUSDCAmount = parseEther("10000");
      await cUsdc.connect(deployer).mint(mintUSDCAmount);

      // mintAmount / 0.02 == mA / (100 / 200)
      const exchangeRate = await cWbtc.exchangeRateStored();
      const underlyingDecimals = await wbtc.decimals();
      const scale = BigNumber.from(10).pow(underlyingDecimals);
      const cWbtcMinted = mintAmount.mul(scale).div(exchangeRate);

      expect(await cWbtc.balanceOf(user1.address)).equal(cWbtcMinted);
    });

    it("user1 enters wbtc and usdc markets", async function () {
      const markets = [cWbtc.address];
      await unitroller.connect(user1).enterMarkets(markets);

      expect(await unitroller.getAssetsIn(user1.address)).to.have.all.members(
        markets
      );
    });

    it("user1 borrows usdc 4000", async function () {

      const borrowAmount = parseEther("4000");
      await cUsdc.connect(user1).borrow(borrowAmount);
    });

    it("wbtc price falls to 14_000 and user1 becomes undercollaterized", async function () {
      const newWbtcPrice = "14000";
      await priceOracle
        .connect(deployer)
        .setUnderlyingPrice(cWbtc.address, parseEther(newWbtcPrice));

      const depositedAmount = parseEther("1");
      const collateralAmount = depositedAmount.mul(25).div(100); // 25% collateral factor
      const collateralAmountUSD = collateralAmount.mul(newWbtcPrice);
      const borrowAmountUSD = parseEther("4000");
      // shortfall = borrowAmountUSD - collateralAmountUSD
      const expectedShortfallUSD = borrowAmountUSD.sub(collateralAmountUSD);

      const shortfall = (
        await unitroller.getAccountLiquidity(user1.address)
      )[2];
      console.log("Shortfall: ", shortfall);
      expect(shortfall).to.be.gt(1);
      expect(shortfall).equal(expectedShortfallUSD);
    });

    it("user2 liquidates user1's positions", async function () {
      const user2balanceBefore = await cWbtc.balanceOf(user2.address);

      // liquidator gets max close factor
      const closeFactor = await unitroller.closeFactorMantissa();
      // calculate max repay amount
      // needs to create call() function, without executing
      const borrowBalanceCalldata = (
        await cUsdc.populateTransaction.borrowBalanceCurrent(user1.address)
      ).data;
      const borrowBalanceEncoded = await provider.call({
        to: cUsdc.address,
        data: borrowBalanceCalldata,
      });
      const borrowBalance = abiCoder.decode(["uint"], borrowBalanceEncoded)[0];
      const maxRepayAmount = borrowBalance.mul(closeFactor).div(WeiPerEther);
      console.log("borrowBalance", borrowBalance);
      console.log("maxRepayAmount", maxRepayAmount);
      const repayAmountUsdc = maxRepayAmount;
      // liquidation
      await cUsdc
        .connect(user2)
        .liquidateBorrow(user1.address, repayAmountUsdc, cWbtc.address);

      const balanceAfter = await cWbtc.balanceOf(user2.address);
      console.log("liquidator balance after ", balanceAfter);
      console.log(
        "liquidator profit cWbtc",
        balanceAfter.sub(user2balanceBefore)
      );

      // liquidator gets profit
      const wbtcBalanceBefore = await wbtc.balanceOf(user2.address);
      await cWbtc.connect(user2).redeem(balanceAfter);
      const wbtcBalanceAfter = await wbtc.balanceOf(user2.address);

      console.log("WBTC profit:", wbtcBalanceAfter.sub(wbtcBalanceBefore));
      console.log(
        "USD profit: ",
        wbtcBalanceAfter.sub(wbtcBalanceBefore).mul(14000).div(WeiPerEther)
      );
      const [, liquidity, shortfall] = await unitroller.getAccountLiquidity(
        user1.address
      );
      expect(liquidity).to.be.gt(1);
      expect(shortfall).equal(0);
    });

    it("cTokens got reserves after liquidation", async function () {
      const reserves = await cWbtc.totalReserves();
      console.log("reserves after liquidation:", reserves);
      expect(reserves).to.be.gt("10");
    });
  });

  // ######################
  // LIQUIDATION SCENARIO 2
  // todo check liquidation with good asset
  describe("LIQUIDATION SCENARIO 2", function () {
    before(async function () {
      const initBalance = parseEther("100000");
      await wbtc.connect(user1).approve(cWbtc.address, initBalance);
      await priceOracle.setUnderlyingPrice(cWbtc.address, parseEther("20000"));
    });

    after(async function () {
      await network.provider.request({
        method: "evm_revert",
        params: [snapshotIdBase],
      });
    });

    it("Should return correct initial balance and approvals", async function () {
      const initBalance = parseEther("100000");
      const user1Bal = await usdc.balanceOf(user1.address);
      const user1Bal2 = await wbtc.balanceOf(user1.address);
      const user2Bal = await wbtc.balanceOf(user2.address);

      const user1Apr = await usdc.allowance(user1.address, cUsdc.address);
      // const user1Apr2 = await wbtc.allowance(user1.address, cWbtc.address);
      const user2Apr = await usdt.allowance(user2.address, cUsdt.address);

      expect(initBalance).equal(user1Bal).equal(user2Bal).equal(user1Bal2);
      expect(initBalance).equal(user1Apr).equal(user2Apr);
    });

    it("user1 mints 1 WBTC and 10000 USDT and deployer mints 10000 USDC and 10000 USDT", async function () {
      // console.log(
      //   "liquidity: ",
      //   await unitroller.getAccountLiquidity(user1.address)
      // );
      const mintAmount = parseEther("1");
      await cWbtc.connect(user1).mint(mintAmount);
      const mintUSDCAmount = parseEther("10000");
      await cUsdt.connect(user1).mint(mintUSDCAmount);
      await cUsdc.connect(deployer).mint(mintUSDCAmount);
      await cUsdt.connect(deployer).mint(mintUSDCAmount);

      // mintAmount / 0.02 == mA / (100 / 200)
      const exchangeRate = await cWbtc.exchangeRateStored();
      const underlyingDecimals = await wbtc.decimals();
      const scale = BigNumber.from(10).pow(underlyingDecimals);
      const cWbtcMinted = mintAmount.mul(scale).div(exchangeRate);

      expect(await cWbtc.balanceOf(user1.address)).equal(cWbtcMinted);
    });

    it("user1 collateral liquidity ", async function () {
      const markets = [cWbtc.address, cUsdt.address];
      await unitroller.connect(user1).enterMarkets(markets);

      const usdtCollateralFactor = parseEther("0.50");
      const wbtcCollateralFactor = parseEther("0.25");
      const wbtcPrice = await priceOracle.getUnderlyingPrice(cWbtc.address);

      const wbtcCollateralUSD = wbtcPrice.mul(1).mul(wbtcCollateralFactor).div(WeiPerEther);
      const usdtCollateralUSD = parseEther("10000").mul(usdtCollateralFactor).div(WeiPerEther);

      const [, liquidity, shortfall] = await unitroller.getAccountLiquidity(
        user1.address
      );
      console.log("Usr1 liquidity USD:", liquidity);
      expect(liquidity).equal(wbtcCollateralUSD.add(usdtCollateralUSD));
      expect(shortfall).equal(0);
    });

    it("user1 enters wbtc and usdc markets", async function () {
      const markets = [cWbtc.address, cUsdt.address];
      await unitroller.connect(user1).enterMarkets(markets);

      expect(await unitroller.getAssetsIn(user1.address)).to.have.all.members(
        markets
      );
    });

    it("user1 borrows usdc 8000", async function () {
      const borrowAmount = parseEther("8000");
      await cUsdc.connect(user1).borrow(borrowAmount);
      const [, liquidity, shortfall] = await unitroller.getAccountLiquidity(
        user1.address
      );
      console.log("Usr1 liquidity USD:", liquidity);
      expect(liquidity).equal(parseEther("2000"));
      expect(shortfall).equal(0);
      // supply: 1*20000*0.25 + 10000*0.5 = 5000+5000 = 10000 usd
      // borrow: 8000 usd
    });

    it("wbtc price falls to 10_000 and user1 becomes undercollaterized", async function () {
      const newWbtcPrice = "10000";
      await priceOracle
        .connect(deployer)
        .setUnderlyingPrice(cWbtc.address, parseEther(newWbtcPrice));
      // supply: 1*10000*0.25 + 10000*0.5 = 2500+5000 = 7500 usd
      // borrow: 8000 usd

      // const depositedAmount = parseEther("1");
      // const collateralAmount = depositedAmount.mul(25).div(100); // 25% collateral factor
      // const collateralAmountUSD = collateralAmount.mul(newWbtcPrice);
      // const borrowAmountUSD = parseEther("4000");
      // // shortfall = borrowAmountUSD - collateralAmountUSD
      // const expectedShortfallUSD = borrowAmountUSD.sub(collateralAmountUSD);

      const shortfall = (await unitroller.getAccountLiquidity(user1.address))[2];
      console.log("Shortfall: ", shortfall);
      expect(shortfall).equal(parseEther("500"));
    });

    it("user2 liquidates user1's positions and takes USDC as incentive", async function () {
      const user2balanceBefore = await cUsdt.balanceOf(user2.address);

      // liquidator gets max close factor
      const closeFactor = await unitroller.closeFactorMantissa();
      // calculate max repay amount
      // needs to create call() function, without executing
      const borrowBalanceCalldata = (await cUsdc.populateTransaction.borrowBalanceCurrent(user1.address)).data;
      const borrowBalanceEncoded = await provider.call({
        to: cUsdc.address,
        data: borrowBalanceCalldata,
      });
      const borrowBalance = abiCoder.decode(["uint"], borrowBalanceEncoded)[0];
      const maxRepayAmount = borrowBalance.mul(closeFactor).div(WeiPerEther).sub(parseEther("0.00001"));
      console.log("borrowBalance", borrowBalance);
      console.log("maxRepayAmount", maxRepayAmount);
      const repayAmountUsdc = maxRepayAmount;
      // liquidation
      await cUsdc
        .connect(user2)
        .liquidateBorrow(user1.address, repayAmountUsdc, cUsdt.address);

      const balanceAfter = await cUsdt.balanceOf(user2.address);
      console.log("liquidator balance after ", balanceAfter);
      console.log("liquidator profit cUSDt", balanceAfter.sub(user2balanceBefore));

      // liquidator gets profit
      const usdtBalanceBefore = await usdt.balanceOf(user2.address);
      await cUsdt.connect(user2).redeem(balanceAfter);
      const usdtBalanceAfter = await usdt.balanceOf(user2.address);

      console.log("USDT profit:", usdtBalanceAfter.sub(usdtBalanceBefore).sub(repayAmountUsdc));
      console.log(
        "USD profit: ",
        usdtBalanceAfter.sub(usdtBalanceBefore).sub(repayAmountUsdc).div(WeiPerEther)
      );
      console.log(
        "liquidity: ",
        await unitroller.getAccountLiquidity(user1.address)
      );
      const [, liquidity, shortfall] = await unitroller.getAccountLiquidity(
        user1.address
      );
      expect(liquidity).to.be.gt(1);
      expect(shortfall).equal(0);
    });

    it("cTokens got reserves after liquidation", async function () {
      const reserves = await cUsdt.totalReserves();
      console.log("USDT reserves after liquidation (in wei):", reserves);
      expect(reserves).to.be.gt("10");
    });
    // 
  });
});
