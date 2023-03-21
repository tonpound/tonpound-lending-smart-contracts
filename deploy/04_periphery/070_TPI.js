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

  const unitroller = await deployments.get("Unitroller");
  const transferAmount = parseEther("200000000");

  const name = "Tonpound Participation Index";
  const symbol = "TPI";
  const initMintReceiver = deployer;
  const initMintAmount = parseEther("500000000");
  const gNft = params.gNft;

  const tpi = await deploy("TPI", {
    from: deployer,
    args: [name, symbol, initMintReceiver, initMintAmount, gNft],
  });
  console.log(`TPI deployed to ${tpi.address}`);

  const TPI = await getContractAt("TPI", tpi.address);
  const tx = await TPI.transfer(unitroller.address, transferAmount);
  await tx.wait();
  console.log("Transfer done", await TPI.balanceOf(deployer));
  console.log("Transfer done", await TPI.balanceOf(unitroller.address));
};

module.exports.tags = ["TPI"];
// module.exports.dependencies = ["Comptroller"];
