module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (process.env.ComptrollerNew === true) { // check to prevent comptroller update

    const comptrollerV2 = await deploy("ComptrollerV2", {
      contract: "Comptroller", // put here contract name with updated version
      from: deployer,
      args: [],
    });
    const unitroller = await deployments.get("Unitroller");

    const ComptrollerV2 = await getContractAt(
      "Comptroller",
      comptrollerV2.address
    );
    const Unitroller = await getContractAt("Unitroller", unitroller.address);

    // set implementation for the unitroller
    let tx = await Unitroller._setPendingImplementation(ComptrollerV2.address);
    await tx.wait();
    tx = await Unitroller._acceptImplementation();
    await tx.wait();
    console.log(`Unitroller set implementation ${ComptrollerV2.address}`);

    // set unitroller for comptroller
    tx = await ComptrollerV2._become(Unitroller.address);
    await tx.wait();
    console.log(
      `Comptroller accepted unitroller implementation ${Unitroller.address}`
    );
  }
};

module.exports.tags = ["ComptrollerUpg"];
// module.exports.dependencies = ["Comptroller"];
