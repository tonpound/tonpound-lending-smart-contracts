// const hre = require("hardhat");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const usdt = await deploy("USDT", {
    contract: "ERC20MockToken6",
    from: deployer,
    args: ["Tether USD", "USDC"],
  });

  const usdc = await deploy("USDC", {
    contract: "ERC20MockToken6",
    from: deployer,
    args: ["Circle USD", "USDC"],
  });

  const dai = await deploy("DAI", {
    contract: "ERC20MockToken",
    from: deployer,
    args: ["Dai stablecoin", "DAI"],
  });

  const wbtc = await deploy("WBTC", {
    contract: "ERC20MockToken8",
    from: deployer,
    args: ["Wrapped Bitcoin", "WBTC"],
  });

  const weth = await deploy("WETH", {
    contract: "ERC20MockToken",
    from: deployer,
    args: ["Wrapped Ethereum", "WETH"],
  });

  const fakePTon = await deploy("fakePTon", {
    contract: "ERC20MockToken",
    from: deployer,
    args: ["fakePTon Token", "fakePTon"],
  });

  const contractUSDT = await getContractAt("ERC20MockToken6", usdt.address);
  const contractUSDC = await getContractAt("ERC20MockToken6", usdc.address);
  const contractDAI = await getContractAt("ERC20MockToken", dai.address);
  const contractWBTC = await getContractAt("ERC20MockToken8", wbtc.address);
  const contractWETH = await getContractAt("ERC20MockToken", weth.address);
  const contractFPTon = await getContractAt("ERC20MockToken", fakePTon.address);

  const deployerBalance = await contractWETH.balanceOf(deployer);
  if (deployerBalance.eq("0")) {
    await contractUSDT.mint(deployer, utils.parseUnits("5000.0"));
    await contractUSDC.mint(deployer, utils.parseUnits("5000.0"));
    await contractDAI.mint(deployer, utils.parseUnits("5000.0"));
    await contractWBTC.mint(deployer, utils.parseUnits("5000.0"));
    await contractWETH.mint(deployer, utils.parseUnits("500000.0"));
    await contractFPTon.mint(deployer, utils.parseUnits("500000.0"));
  }

  console.log("USDT:", usdt.address);
  console.log("USDC:", usdc.address);
  console.log("WBTC:", wbtc.address);
  console.log("WETH:", weth.address);
};
module.exports.tags = ["ERC20", "Test"];
