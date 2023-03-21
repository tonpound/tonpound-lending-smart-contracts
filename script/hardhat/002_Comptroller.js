const hre = require("hardhat");
const { saveContractAddress } = require("./utils");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log(
    `Deploying Comptroller contract with the account:`,
    deployer.address
  );
  const Comptroller = await hre.ethers.getContractFactory("Comptroller");
  const comptroller = await Comptroller.deploy();

  console.log(`Comptroller deployed to ${comptroller.address}`);
  saveContractAddress("hh", "Comptroller", comptroller.address);

  console.log(
    `Deploying Unitroller contract with the account:`,
    deployer.address
  );

  const Unitroller = await hre.ethers.getContractFactory("Unitroller");
  const unitroller = await Unitroller.deploy();
  await unitroller.deployed();

  saveContractAddress("hh", Unitroller, unitroller.address);

  console.log(`Unitroller deployed to address:`, unitroller.address);

  // set implementation for the unitroller
  unitroller._setPendingImplementation(comptroller.address);
  console.log(`Unitroller setted implementation ${comptroller.address}`);
  
  // set unitroller for comptroller
  comptroller._become(unitroller.address);
  console.log(`Comptroller accepted unitroller implementation ${unitroller.address}`);


  // unitroller pref
  unitroller._setPauseGuardian(deployer.address);
  unitroller._setBorrowCapGuardian(deployer.address);

  // const priceOracle = hre.ethers.getContractAt("SimplePriceOacle");
  // console.log("price:", priceOracle)
  // unitroller._setPriceOracle(priceOracle);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
