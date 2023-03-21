const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const ERC20 = await hre.ethers.getContractFactory("ERC20MockToken");

  const usdt = await ERC20.deploy("Tether USD", "USDC");
  await usdt.deployed();
  await usdt.mint(deployer.address, hre.ethers.utils.parseUnits("500.0"));

  const usdc = await ERC20.deploy("Circle USD", "USDC");
  await usdc.deployed();
  await usdc.mint(deployer.address, hre.ethers.utils.parseUnits("500.0"));

  const wbtc = await ERC20.deploy("Wrapped Bitcoin", "WBTC");
  await wbtc.deployed();
  await wbtc.mint(deployer.address, hre.ethers.utils.parseUnits("500.0"));

  // fs.writeFileSync()
  console.log("USDT:", usdt.address);
  console.log("USDC:", usdc.address);
  console.log("WBTC:", wbtc.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
