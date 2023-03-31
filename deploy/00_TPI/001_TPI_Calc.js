const { parseEther } = require("ethers/lib/utils");
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

  // const unitroller = await deployments.get("Unitroller");
  // const transferAmount = parseEther("200000000");

  const name = "Tonpound Participation Index";
  const symbol = "TPI";
  const initMintReceiver = deployer;
  const initMintAmount = parseEther("500000000");
  const gNft = params.gNft;

  console.log(`TPI deploy`);
  const tpi = await deploy("TPI", {
    from: deployer,
    args: [name, symbol, initMintReceiver, initMintAmount, gNft],
  });
  console.log(`TPI deployed to ${tpi.address}`);

  const TPI = await getContractAt("TPI", tpi.address);
  console.log("Deployer balance:", await TPI.balanceOf(deployer));

  console.log(`SupplyCalculator deploy...`);
  const calculator = await deploy("SupplyCalculator", {
    from: deployer,
    args: [tpi.address],
  });

  const tx = await TPI.setSupplyCalculator(calculator.address);
  await tx.wait();

};

module.exports.tags = ["TPI"];
// module.exports.dependencies = ["Comptroller"];
