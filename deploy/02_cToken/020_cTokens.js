const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils, BigNumber },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const unitroller = (await deployments.get("Unitroller")).address;
  const becomeImplementationData = "0x";

  const implementation = await deploy("CErc20Delegate", {
    contract: "CErc20Delegate",
    from: deployer,
    args: [],
  });
  // USDC
  const usdc = params.USDC;
  const stableRM = await deployments.get("StableRateModelV2");
  const usdcContract = await getContractAt("ERC20MockToken", usdc);
  let underlyingDecimals = await usdcContract.decimals();
  // initialExchangeRateMantissa depends on underlying decimals
  // initialExchangeRateMantissa = 2 * 10 ** (8 + underlyingDecimals)
  let initialExchangeRateMantissa = BigNumber.from(10)
    .pow(8 + underlyingDecimals)
    .mul(2);
  let name = "Tonpound USD Coin";
  let symbol = "tUSDC";
  console.log(`${symbol} - ${initialExchangeRateMantissa}`);

  const decimals = 8;

  const cUSDC = await deploy("cUSDC", {
    contract: "CErc20Delegator",
    from: deployer,
    args: [
      usdc,
      unitroller,
      stableRM.address,
      initialExchangeRateMantissa,
      name,
      symbol,
      decimals,
      deployer,
      implementation.address,
      becomeImplementationData,
    ],
  });
  console.log(`tUSDC deployed to ${cUSDC.address}`);

  // USDT
  const usdt = params.USDT;
  const usdtContract = await getContractAt("ERC20MockToken", usdt);
  underlyingDecimals = await usdtContract.decimals();
  initialExchangeRateMantissa = BigNumber.from(10)
    .pow(8 + underlyingDecimals)
    .mul(2);
  name = "Tonpound USDT";
  symbol = "tUSDT";
  console.log(`${symbol} - ${initialExchangeRateMantissa}`);

  const cUsdt = await deploy("cUSDT", {
    contract: "CErc20Delegator",
    from: deployer,
    args: [
      usdt,
      unitroller,
      stableRM.address,
      initialExchangeRateMantissa,
      name,
      symbol,
      decimals,
      deployer,
      implementation.address,
      becomeImplementationData,
    ],
  });
  console.log(`cUsdt deployed to ${cUsdt.address}`);

  // DAI
  const dai = params.DAI;
  const daiContract = await getContractAt("ERC20MockToken", dai);
  underlyingDecimals = await daiContract.decimals();
  initialExchangeRateMantissa = BigNumber.from(10)
    .pow(8 + underlyingDecimals)
    .mul(2);
  name = "Tonpound Dai";
  symbol = "tDAI";
  console.log(`${symbol} - ${initialExchangeRateMantissa}`);

  const cDai = await deploy("cDAI", {
    contract: "CErc20Delegator",
    from: deployer,
    args: [
      dai,
      unitroller,
      stableRM.address,
      initialExchangeRateMantissa,
      name,
      symbol,
      decimals,
      deployer,
      implementation.address,
      becomeImplementationData,
    ],
  });
  console.log(`cDAI deployed to ${cDai.address}`);

  // WETH
  const weth = params.WETH;
  const rateModelWeth = await deployments.get("JumpRateModelV2_1");
  const wethContract = await getContractAt("ERC20MockToken", weth);
  underlyingDecimals = await wethContract.decimals();
  initialExchangeRateMantissa = BigNumber.from(10)
    .pow(8 + underlyingDecimals)
    .mul(2);
  name = "Tonpound Wrapped ETH";
  symbol = "tWETH";
  console.log(`${symbol} - ${initialExchangeRateMantissa}`);

  const cWeth = await deploy("cWeth", {
    contract: "CErc20Delegator",
    from: deployer,
    args: [
      weth,
      unitroller,
      rateModelWeth.address,
      initialExchangeRateMantissa,
      name,
      symbol,
      decimals,
      deployer,
      implementation.address,
      becomeImplementationData,
    ],
  });
  console.log(`tWeth deployed to ${cWeth.address}`);

  // WBTC
  const wbtc = params.WBTC;
  const rateModelWbtc = await deployments.get("JumpRateModelV2_2");
  const wbtcContract = await getContractAt("ERC20MockToken", wbtc);
  underlyingDecimals = await wbtcContract.decimals();
  initialExchangeRateMantissa = BigNumber.from(10)
    .pow(8 + underlyingDecimals)
    .mul(2);
  name = "Tonpound Wrapped BTC";
  symbol = "tWBTC";
  console.log(`${symbol} - ${initialExchangeRateMantissa}`);

  const cWbtc = await deploy("cWbtc", {
    contract: "CErc20Delegator",
    from: deployer,
    args: [
      wbtc,
      unitroller,
      rateModelWbtc.address,
      initialExchangeRateMantissa,
      name,
      symbol,
      decimals,
      deployer,
      implementation.address,
      becomeImplementationData,
    ],
  });
  console.log(`tWbtc deployed to ${cWbtc.address}`);
};

module.exports.tags = ["CERC"];
// module.exports.dependencies = ["RateModels"];
