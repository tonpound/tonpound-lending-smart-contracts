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

  const pTONAddress = params.pTON;
  const stTon = params.stTon;
  const stTonBytes32 = "0x000000000000000000000000" + stTon.slice(2);
  const becomeImplementationData = stTonBytes32;

  const pTon = await getContractAt("PooledTON", pTONAddress);
  const underlyingDecimals = await pTon.decimals();
  console.log("underlyingDecimals", underlyingDecimals);
  if (underlyingDecimals !== 9) {
    console.log("Wrong pTON decimals.");
    return;
  }

  // implementation for cpTON
  const implementation = await deploy("CpTonDelegate", {
    contract: "CpTonDelegate",
    from: deployer,
    args: [],
  });
  console.log(`CpTonDelegate implementation ${implementation.address}`);

  // cpTon
  const name = "Tonpound pTON";
  const symbol = "tpTON";
  const decimals = 8;
  // initialExchangeRateMantissa depends on underlying decimals
  // initialExchangeRateMantissa = 2 * 10 ** (8 + underlyingDecimals)
  const initialExchangeRateMantissa = BigNumber.from(10)
    .pow(8 + underlyingDecimals)
    .mul(2);

  const pTonRateModel = await deployments.get("JumpRateModelV2_3");

  const cpTon = await deploy("cpTon", {
    contract: "CErc20Delegator",
    from: deployer,
    args: [
      pTONAddress,
      unitroller,
      pTonRateModel.address,
      initialExchangeRateMantissa,
      name,
      symbol,
      decimals,
      deployer,
      implementation.address,
      becomeImplementationData, // necessary data for the CpTon
    ],
  });
  console.log(`cpTon deployed to ${cpTon.address}`);

  const cpTonContract = await getContractAt("CErc20Delegate", cpTon.address);
  const tx = await cpTonContract._setReserveFactor(params.reserveFactor);
  await tx.wait();
};

// module.exports.tags = ["CPTON", "Test"];
// module.exports.dependencies = ["RateModels"];
