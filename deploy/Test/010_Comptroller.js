module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const networkId = (await getChainId()).toString();
  if (networkId === "1") {
    console.log(`Deployer ${deployer}`);
    console.log(`Deploy to chain ${networkId} will start in 7 seconds`);
    await new Promise((resolve) => setTimeout(resolve, 7000));
    console.log("Start");
  }

  const comptroller = await deploy("Comptroller", {
    from: deployer,
    args: [],
  });
  console.log(`Comptroller deployed to ${comptroller.address}`);

  const unitroller = await deploy("Unitroller", {
    from: deployer,
    args: [],
  });
  console.log(`Unitroller deployed to address:`, unitroller.address);

  const Unitroller = await getContractAt("Unitroller", unitroller.address);
  const Comptroller = await getContractAt("Comptroller", comptroller.address);

  // set implementation for the unitroller
  let tx = await Unitroller._setPendingImplementation(Comptroller.address);
  await tx.wait();
  tx = await Unitroller._acceptImplementation();
  await tx.wait();
  console.log(`Unitroller set implementation ${Comptroller.address}`);

  // set unitroller for comptroller
  tx = await Comptroller._become(Unitroller.address);
  await tx.wait();
  console.log(
    `Comptroller accepted unitroller implementation ${Unitroller.address}`
  );
};

module.exports.tags = ["tComptroller", "Test"];
