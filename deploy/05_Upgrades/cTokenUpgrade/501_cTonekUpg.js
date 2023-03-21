// module.exports = async ({
//   getNamedAccounts,
//   deployments,
//   getChainId,
//   getUnnamedAccounts,
//   ethers: { getContractAt, utils },
// }) => {
//   const { deploy } = deployments;
//   const { deployer } = await getNamedAccounts();

//   // cWBTC
//   const newImplementation = await deploy("CErc20DelegateV2", {
//     contract: "CErc20Delegate",
//     from: deployer,
//     args: [],
//   });
//   const allowResign = true;
//   const cWbtc = await deployments.get("cWbtc");
//   const cWBTCContract = await getContractAt("CErc20Delegator", cWbtc.address);
//   let becomeImplementationData = "0x";

//   let tx = await cWBTCContract._setImplementation(
//     newImplementation.address,
//     allowResign,
//     becomeImplementationData
//   );
//   await tx.wait();
//   console.log("C-WBTC updated");

//   // cUSDT
//   const cUsdt = await deployments.get("cUSDT");
//   const cUSDTContract = await getContractAt("CErc20Delegator", cUsdt.address);
//   tx = await cUSDTContract._setImplementation(
//     newImplementation.address,
//     allowResign,
//     becomeImplementationData
//   );
//   await tx.wait();
//   console.log("C-USDT updated");

//   // cpTon
//   const newPTonImplementation = await deploy("CpTonDelegateV2", {
//     contract: "CpTonDelegate",
//     from: deployer,
//     args: [],
//   });
//   const cpTon = await deployments.get("cpTon");
//   const cpTonContract = await getContractAt("CErc20Delegator", cpTon.address);
//   const StakedTonAddress =
//     "0x000000000000000000000000495A0087DDC8eD96F9F1fAeEC11341417F8c48EF"; // goerli
//   becomeImplementationData = StakedTonAddress;

//   tx = await cpTonContract._setImplementation(
//     newPTonImplementation.address,
//     allowResign,
//     becomeImplementationData
//   );
//   await tx.wait();
//   console.log("C-pTon updated");
// };

// module.exports.tags = ["CTokenUpg"];
// // module.exports.dependencies = ["Comptroller"];
