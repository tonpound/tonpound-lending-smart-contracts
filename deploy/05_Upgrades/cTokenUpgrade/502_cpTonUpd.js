// module.exports = async ({
//   getNamedAccounts,
//   deployments,
//   getChainId,
//   getUnnamedAccounts,
//   ethers: { getContractAt, utils },
// }) => {
//   const { deploy } = deployments;
//   const { deployer } = await getNamedAccounts();

//   const unitroller = await deployments.get("Unitroller");

//   const pTonDeployments = await deployments.get("pTon");
//   const stTonDeployments = await deployments.get("stTon");
//   const PooledTONAddress = pTonDeployments.address;
//   const StakedTonAddress =
//     "0x000000000000000000000000" + stTonDeployments.address.slice(2);

//   // const PooledTONAddress = "0x2a4B650D86b8E3Df9548f7F17185b517c03900af"; // goerli
//   // const StakedTonAddress =
//   //   "0x000000000000000000000000495A0087DDC8eD96F9F1fAeEC11341417F8c48EF"; // goerli

//   const becomeImplementationData = StakedTonAddress;

//   const newImplementation = await deploy("CpTonDelegate4", {
//     contract: "CpTonDelegate",
//     from: deployer,
//     args: [],
//   });

//   console.log(`CpTonDelegate implementation ${newImplementation.address}`);

//   // cpTon
//   const cpTonDeployments = await deployments.get("cpTon");
//   const cpTon = await getContractAt("CErc20Delegator", cpTonDeployments.address);
//   const txUpdateImpl = await cpTon._setImplementation(
//     newImplementation.address,
//     true,
//     becomeImplementationData
//   );
//   await txUpdateImpl.wait();

//   console.log(`cpTon deployed to ${cpTon.address}`);
// };

// module.exports.tags = ["CPTONUPD"];
// // module.exports.dependencies = ["RateModels"];
