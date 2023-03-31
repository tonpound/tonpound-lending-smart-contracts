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

//   // cUSDC
//   const cUsdc = await deployments.get("cUSDC");
//   const cUSDCContract = await getContractAt("CErc20Delegator", cUsdc.address);
//   tx = await cUSDCContract._setImplementation(
//     newImplementation.address,
//     allowResign,
//     becomeImplementationData
//   );
//   await tx.wait();
//   console.log("C-USDC updated");

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

//   // cDAI
//   const cDai = await deployments.get("cDAI");
//   const cDaiContract = await getContractAt("CErc20Delegator", cDai.address);
//   tx = await cDaiContract._setImplementation(
//     newImplementation.address,
//     allowResign,
//     becomeImplementationData
//   );
//   await tx.wait();
//   console.log("C-DAI updated");

//   // cWeth
//   const cWeth = await deployments.get("cWeth");
//   const cWethContract = await getContractAt("CErc20Delegator", cWeth.address);
//   tx = await cWethContract._setImplementation(
//     newImplementation.address,
//     allowResign,
//     becomeImplementationData
//   );
//   await tx.wait();
//   console.log("C-WETH updated");

//   // cpTon
//   const newPTonImplementation = await deploy("CpTonDelegateV2", {
//     contract: "CpTonDelegate",
//     from: deployer,
//     args: [],
//   });
//   // newPTonImplementation = await deployments.get("CpTonDelegateV2");

//   const cpTon = await deployments.get("cpTon");
//   const cpTonContract = await getContractAt("CErc20Delegator", cpTon.address);
//   const StakedTonAddress =
//     "0x0000000000000000000000009Ac34Ae030Af089A421FbB09cAbC48184B15FEEa"; // goerli
//   becomeImplementationData = StakedTonAddress;
//   // allowResign = true;
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
