const { params } = require("../../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  ethers: { getContractAt, utils, BigNumber },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!process.env.REDEPLOY) {
    console.log("To redeploy wrong contract set env REDEPLOY='true'");
    return;
  }

  const unitroller = (await deployments.get("Unitroller")).address;
  const becomeImplementationData = "0x";

  const implementation = await deployments.get("CErc20Delegate");
  const stableRM = await deployments.get("StableRateModelV2");
  const decimals = 8;

  // DAI
  const dai = params.DAI;
  const daiContract = await getContractAt("ERC20MockToken", dai);
  const underlyingDecimals = await daiContract.decimals();
  const initialExchangeRateMantissa = BigNumber.from(10)
    .pow(8 + underlyingDecimals)
    .mul(2);
  const name = "Tonpound Dai";
  const symbol = "tDAI";

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

  // set Reserve Factor
  const cDaiContract = await getContractAt("CErc20Delegate", cDai.address);
  let tx = await cDaiContract._setReserveFactor(params.reserveFactor);
  await tx.wait();
  console.log(`Reserve Factor added`);

  // set Price for underlying
  const priceOracle = await deployments.get("TonpoundPriceOracle");
  const PriceOracle = await getContractAt(
    "TonpoundPriceOracle",
    priceOracle.address
  );
  tx = await PriceOracle._setPriceFeedForUnderlying(
    dai,
    params.chainlink.dai.feed,
    params.chainlink.dai.decimals
  );
  await tx.wait();
  console.log(`Price ${cDai.address} added`);

  // support market
  const Unitroller = await getContractAt("Comptroller", unitroller);
  tx = await Unitroller._supportMarket(cDai.address);
  await tx.wait();
  console.log(`Market ${cDai.address} added`);

  // Token borrow cap
  const daiCap = utils.parseUnits("300000", "18");
  tx = await Unitroller._setMarketBorrowCaps([cDai.address], [daiCap]);
  await tx.wait();
  console.log(`Borrow cap added.`);

  // TPI
  const cDaiWRONG = "0xc24815650C18479de58d9741100cB9FFaF8ee2f4";
  const contracts = [cDai.address, cDaiWRONG];

  const supplySpeed = utils.parseUnits("661.37565", 18);
  const supplySpeeds = [supplySpeed, "0"];
  const borrowSpeeds = ["0", "0"];
  tx = await Unitroller._setCompSpeeds(contracts, supplySpeeds, borrowSpeeds);
  await tx.wait();
  console.log("TPI speeds were set.");

  // Collateral factor
  tx = await Unitroller._setCollateralFactor(
    cDai.address,
    params.collateralFactor
  );
  await tx.wait();
  console.log("Collateral Factor set.");

  // remove wrong token
  const cTokenWRONG = await getContractAt("CErc20Delegate", cDaiWRONG);
  tx = await Unitroller._setCollateralFactor(cDaiWRONG, 0);
  await tx.wait();
  tx = await Unitroller._setBorrowPaused(cDaiWRONG, "true");
  await tx.wait();
  tx = await Unitroller._setMintPaused(cDaiWRONG, "true");
  await tx.wait();
  tx = await cTokenWRONG._setReserveFactor("1000000000000000000");
  await tx.wait();

  console.log("Wrong market removed.");
};

module.exports.tags = ["CERCredeploy"];
