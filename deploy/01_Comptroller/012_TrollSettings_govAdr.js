const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils, provider },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const unitroller = await deployments.get("Unitroller");
  const UnitrollerUpg = await getContractAt("Comptroller", unitroller.address);

  const TPI = params.TPI;
  const treasury = params.treasury;
  const gNft = params.gNft;

  console.log(`Setting TPI ${TPI} ...`);
  let tx = await UnitrollerUpg._setCompAddress(TPI);
  await tx.wait();

  console.log(`Settong Treasury ${treasury} ...`);
  tx = await UnitrollerUpg._setTreasury(treasury);
  await tx.wait();

  console.log(`Setting gNFT ${gNft} ...`);
  tx = await UnitrollerUpg._setGNft(gNft);
  await tx.wait();
};

module.exports.tags = ["TrollSet2", "Test"];
// module.exports.dependencies = ["Comptroller", "TPI"];
