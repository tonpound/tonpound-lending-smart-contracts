// const { parseEther } = require("ethers/lib/utils");

// module.exports = async ({
//   getNamedAccounts,
//   deployments,
//   getChainId,
//   getUnnamedAccounts,
//   ethers: { getContractAt, utils },
// }) => {

//   const { deploy } = deployments;
//   const { deployer, user1, user2 } = await getNamedAccounts();
//   // reserve factor scaled by 1e18
//   // "200000000000000000" means 20% of income goes to reserves
//   const reserveFactorMantissa = "300000000000000000";

//   const cUsdc = await deployments.get("cUSDC");
//   const cUsdt = await deployments.get("cUSDT");
//   const cWbtc = await deployments.get("cWbtc");
//   const cpTon = await deployments.get("cpTon");

//   const Usdc = await deployments.get("USDC");
//   const Usdt = await deployments.get("USDT");
//   const Wbtc = await deployments.get("WBTC");
//   // const pTon = await deployments.get("pTon");
//   // 0x2a4B650D86b8E3Df9548f7F17185b517c03900af

//   const cUsdcContract = await getContractAt("CErc20Delegate", cUsdc.address);
//   const cUsdtContract = await getContractAt("CErc20Delegate", cUsdt.address);
//   const cWbtcContract = await getContractAt("CErc20Delegate", cWbtc.address);
//   const cpTonContract = await getContractAt("CErc20Delegate", cpTon.address);

//   const UsdcContract = await getContractAt("ERC20MockToken", Usdc.address);
//   const UsdtContract = await getContractAt("ERC20MockToken", Usdt.address);
//   const WbtcContract = await getContractAt("ERC20MockToken", Wbtc.address);
//   const pTonContract = await getContractAt("ERC20MockToken", "0x2a4B650D86b8E3Df9548f7F17185b517c03900af");
  

//   const unitroller = await deployments.get("Unitroller");
//   const UnitrollerUpg = await getContractAt("Comptroller", unitroller.address);

//   let tx = await UsdcContract.approve(cUsdcContract.address, parseEther("100000"));
//   await tx.wait();
//   console.log("done");
//   tx = await UsdtContract.approve(cUsdtContract.address, parseEther("100000"));
//   await tx.wait();
//   tx = await WbtcContract.approve(cWbtcContract.address, parseEther("100000"));
//   await tx.wait();
//   tx = await pTonContract.approve(cpTonContract.address, parseEther("100000"));
//   await tx.wait();
//   tx = await UnitrollerUpg.enterMarkets([cUsdc.address, cUsdt.address, cWbtc.address, cpTon.address ])
//   await tx.wait();

//   tx = await UsdcContract.mint(deployer, parseEther("100000"));
//   await tx.wait();
//   tx = await UsdtContract.mint(deployer, parseEther("100000"));
//   await tx.wait();
//   tx = await WbtcContract.mint(deployer, parseEther("100000"));
//   await tx.wait();

//   tx = await cWbtcContract.mint(parseEther("120"));
//   await tx.wait();
//   tx = await cUsdcContract.mint(parseEther("42000"));
//   await tx.wait();
//   tx = await cUsdtContract.mint(parseEther("16300"));
//   await tx.wait();

//   tx = await cWbtcContract.borrow(parseEther("18"));
//   await tx.wait();
//   tx = await cUsdcContract.borrow(parseEther("12200"));
//   await tx.wait();
//   tx = await cUsdtContract.borrow(parseEther("190"));
//   await tx.wait();

//   tx = await cWbtcContract.repayBorrow(parseEther("7.5"));
//   await tx.wait();
//   tx = await cWbtcContract.redeemUnderlying(parseEther("14"));
//   await tx.wait();

//   console.log(`Complete.`);
// };

// module.exports.tags = ["Interact"];
// // module.exports.dependencies = ["Comptroller"];

// // npx hardhat deploy --network goerli --tags "Interact"