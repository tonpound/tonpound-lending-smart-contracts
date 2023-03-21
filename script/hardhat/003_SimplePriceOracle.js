const hre = require("hardhat");
const { saveContractAddress } = require("./utils");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log(
    `Deploying SimplePriceOracle contract with the account:`,
    deployer.address
  );
  const SimplePriceOracle = await hre.ethers.getContractFactory("SimplePriceOracle");
  const priceOracle = await SimplePriceOracle.deploy();

  console.log(`SimplePriceOracle  deployed to ${priceOracle.address}`);
  saveContractAddress("hh", "SimplePriceOracle", priceOracle.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// @todo danger, contract with free access
