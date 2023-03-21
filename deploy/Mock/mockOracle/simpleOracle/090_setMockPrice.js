module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils },
}) => {
  // const { deploy } = deployments;
  // const { deployer } = await getNamedAccounts();

  const cUsdc = await deployments.get("cUSDC");
  const cUsdt = await deployments.get("cUSDT");
  const cWbtc = await deployments.get("cWbtc");
  const cpTon = await deployments.get("cpTon");

  const Usdc = await deployments.get("USDC");
  const Usdt = await deployments.get("USDT");
  const WBTC = await deployments.get("WBTC");
  // const pTon = await deployments.get("pTon");
  const pTonAddress = "0x2a4B650D86b8E3Df9548f7F17185b517c03900af"; // goerli

  const priceOracle = await deployments.get("PriceOracle");
  const PriceOracle = await getContractAt(
    "SimplePriceOracle",
    priceOracle.address
  );

  console.log(`Setting mock prices...`);

  // cTokens
  let tx = await PriceOracle.setUnderlyingPrice(
    cUsdc.address,
    "1000000000000000000"
  );
  await tx.wait();

  tx = await PriceOracle.setUnderlyingPrice(
    cUsdt.address,
    "1000000000000000000"
  );
  await tx.wait();

  tx = await PriceOracle.setUnderlyingPrice(
    cUsdt.address,
    "1000000000000000000"
  );
  await tx.wait();

  tx = await PriceOracle.setUnderlyingPrice(
    cWbtc.address,
    "23434000000000000000000"
  );
  await tx.wait();

  tx = await PriceOracle.setUnderlyingPrice(
    cpTon.address,
    "2408700000000000000"
  );
  await tx.wait();

  // assets
  tx = await PriceOracle.setDirectPrice(Usdc.address, "1000000000000000000");
  await tx.wait();
  tx = await PriceOracle.setDirectPrice(Usdt.address, "1000000000000000000");
  await tx.wait();
  tx = await PriceOracle.setDirectPrice(
    WBTC.address,
    "23434000000000000000000"
  );
  await tx.wait();
  tx = await PriceOracle.setDirectPrice(pTonAddress, "2408700000000000000");
  await tx.wait();

  console.log(`Mock prices were set.`);
};

module.exports.tags = ["MockPrice", "Test"];
// module.exports.dependencies = ["Oracle", "CERC", "CPTON"];
