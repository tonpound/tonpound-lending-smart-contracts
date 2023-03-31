const { params } = require("../../deployConfig.js");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
  ethers: { getContractAt, utils, provider },
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const positionManager = await getContractAt(
    "INonfungiblePositionManager",
    "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
  );

  const usdc = (await deployments.get("USDC")).address;
  const usdt = (await deployments.get("USDT")).address;
  const dai = (await deployments.get("DAI")).address;
  const wbtc = (await deployments.get("WBTC")).address;
  const weth = (await deployments.get("WETH")).address;
  const contractUSDT = await getContractAt("ERC20MockToken6", usdt);
  const contractUSDC = await getContractAt("ERC20MockToken6", usdc);
  const contractDAI = await getContractAt("ERC20MockToken", dai);
  const contractWBTC = await getContractAt("ERC20MockToken8", wbtc);
  const contractWETH = await getContractAt("ERC20MockToken", weth);
  // const contractFPTon = await getContractAt("ERC20MockToken", fakePTon.address);

  let tx = await contractUSDT.mint(deployer, utils.parseEther("10000000000"));
  await tx.wait();
  tx = await contractUSDT.approve(
    positionManager.address,
    utils.parseEther("1000000000000")
  );
  await tx.wait();

  tx = await contractUSDC.mint(deployer, utils.parseEther("10000000000"));
  await tx.wait();
  tx = await contractUSDC.approve(
    positionManager.address,
    utils.parseEther("1000000000000")
  );
  await tx.wait();

  tx = await contractWBTC.mint(deployer, utils.parseEther("10000000000"));
  await tx.wait();
  tx = await contractWBTC.approve(
    positionManager.address,
    utils.parseEther("1000000000000")
  );
  await tx.wait();

  tx = await contractWETH.mint(deployer, utils.parseEther("10000000000"));
  await tx.wait();
  tx = await contractWETH.approve(
    positionManager.address,
    utils.parseEther("1000000000000")
  );
  await tx.wait();

  const poolFactory = await getContractAt(
    "IUniswapV3Factory",
    "0x1F98431c8aD98523631AE4a59f267346ea31F984"
  );

  let fee = "500"; // "100", "500", "3000", "10000"
  const tickSpacing = 10;
  const deadline = "1711099193";

  // pool usdc - weth
  let txNewPool = await poolFactory.createPool(usdc, weth, fee);
  let rc = await txNewPool.wait();
  let event = rc.events.find((event) => event.event === "PoolCreated");
  let [token0, token1, fee_, tickSpace, pool] = event.args;
  let Pool = await getContractAt("IPool", pool);
  console.log("usdc", usdc, "weth", weth);
  console.log("token0", token0, "token1", token1);
  // sqrtPriceX96 = sqrt(price) * 2 ** 96 * 1e(decimals0)
  let tickMiddle;
  let amount0Desired;
  let amount1Desired;
  if (token0.toLowerCase() === usdc.toLowerCase()) {
    tx = await Pool.initialize("1896506216178910992743013190972372");
    await tx.wait();
    tickMiddle = 201673;
    amount0Desired = utils.parseUnits("1000000", 6);
    amount1Desired = utils.parseUnits("573.72", 18);
  } else {
    tx = await Pool.initialize("3308214018452978178609153");
    await tx.wait();
    tickMiddle = -201684;
    amount1Desired = utils.parseUnits("1000000", 6);
    amount0Desired = utils.parseUnits("573.72", 18);
  }
  tx = await Pool.increaseObservationCardinalityNext(180);
  await tx.wait();
  console.log("Adding liquidity weth-usdc", pool);

  // tick = Math.round(tick / tickSpacing) * tickSpacing
  let tickLower = Math.round((tickMiddle - 2500) / tickSpacing) * tickSpacing;
  let tickUpper = Math.round((tickMiddle + 2500) / tickSpacing) * tickSpacing;
  let mintParams = [
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    amount0Desired,
    amount1Desired,
    1,
    1,
    deployer,
    deadline,
  ];
  tx = await positionManager.mint(mintParams);
  await tx.wait();


  // pool wbtc - weth
  txNewPool = await poolFactory.createPool(wbtc, weth, fee);
  rc = await txNewPool.wait();
  event = rc.events.find((event) => event.event === "PoolCreated");
  [token0, token1, fee_, tickSpace, pool] = event.args;
  Pool = await getContractAt("IPool", pool);
  console.log("wbtc", wbtc, "weth", weth);
  console.log("token0", token0, "token1", token1);
  console.log("pool", pool);

  if (token0.toLowerCase() === wbtc.toLowerCase()) {
    tx = await Pool.initialize("31114602193072906433364563777371209");
    await tx.wait();
    tickMiddle = 257630;
    amount0Desired = utils.parseUnits("10.97735", 8);
    amount1Desired = utils.parseUnits("175.43859", 18);
  } else {
    tx = await Pool.initialize("201741346279662927709679");
    await tx.wait();
    tickMiddle = -257630;
    amount1Desired = utils.parseUnits("10.97735", 8);
    amount0Desired = utils.parseUnits("175.43859", 18);
  }
  tx = await Pool.increaseObservationCardinalityNext(180);
  await tx.wait();
  tickLower = Math.round((tickMiddle - 2500) / tickSpacing) * tickSpacing;
  tickUpper = Math.round((tickMiddle + 2500) / tickSpacing) * tickSpacing;

  console.log("Adding liquidity2 wbtc-usdc");
  mintParams = [
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    amount0Desired,
    amount1Desired,
    1,
    1,
    deployer,
    deadline,
  ];
  tx = await positionManager.mint(mintParams);
  await tx.wait();


  // // pool wbtc - usdc
  // txNewPool = await poolFactory.createPool(wbtc, usdc, fee);
  // rc = await txNewPool.wait();
  // event = rc.events.find((event) => event.event === "PoolCreated");
  // [token0, token1, fee_, tickSpace, pool] = event.args;
  // Pool = await getContractAt("IPool", pool);
  // console.log("wbtc", wbtc, "usdc", usdc);
  // console.log("wbtc", token0, "usdc", token1);
  // console.log("pool", pool);

  // if (token0.toLowerCase() === wbtc.toLowerCase()) {
  //   tx = await Pool.initialize("1313796298507795024180494482968");
  //   await tx.wait();
  //   tickMiddle = 56169;
  //   amount0Desired = utils.parseUnits("36.182", 8);
  //   amount1Desired = utils.parseUnits("1000000", 6);
  // } else {
  //   tx = await Pool.initialize("4765695362494942101951741952");
  //   await tx.wait();
  //   tickMiddle = -56221;
  //   amount1Desired = utils.parseUnits("36.182", 8);
  //   amount0Desired = utils.parseUnits("1000000", 6);
  // }
  // tickLower = Math.round((tickMiddle - 2500) / tickSpacing) * tickSpacing;
  // tickUpper = Math.round((tickMiddle + 2500) / tickSpacing) * tickSpacing;

  // console.log("Adding liquidity2 wbtc-usdc");
  // mintParams = [
  //   token0,
  //   token1,
  //   fee,
  //   tickLower,
  //   tickUpper,
  //   amount0Desired,
  //   amount1Desired,
  //   1,
  //   1,
  //   deployer,
  //   deadline,
  // ];
  // tx = await positionManager.mint(mintParams);
  // await tx.wait();


  // // pool wbtc - usdt
  // txNewPool = await poolFactory.createPool(wbtc, usdt, fee);
  // rc = await txNewPool.wait();
  // event = rc.events.find((event) => event.event === "PoolCreated");
  // [token0, token1, fee_, tickSpace, pool] = event.args;
  // Pool = await getContractAt("IPool", pool);
  // console.log("wbtc", wbtc, "usdt", usdt);
  // console.log("wbtc", token0, "usdt", token1);
  // console.log("pool", pool);

  // if (token0.toLowerCase() === wbtc.toLowerCase()) {
  //   tx = await Pool.initialize("1313796298507795024180494482968");
  //   await tx.wait();
  //   tickMiddle = 56169;
  //   amount0Desired = utils.parseUnits("36.182", 8);
  //   amount1Desired = utils.parseUnits("1000000", 6);
  // } else {
  //   tx = await Pool.initialize("4765695362494942101951741952");
  //   await tx.wait();
  //   tickMiddle = -56221;
  //   amount1Desired = utils.parseUnits("36.182", 8);
  //   amount0Desired = utils.parseUnits("1000000", 6);
  // }
  // tickLower = Math.round((tickMiddle - 2500) / tickSpacing) * tickSpacing;
  // tickUpper = Math.round((tickMiddle + 2500) / tickSpacing) * tickSpacing;

  // console.log("Adding liquidity3 wbtc-usdc");
  // mintParams = [
  //   token0,
  //   token1,
  //   fee,
  //   tickLower,
  //   tickUpper,
  //   amount0Desired,
  //   amount1Desired,
  //   1,
  //   1,
  //   deployer,
  //   deadline,
  // ];
  // tx = await positionManager.mint(mintParams);
  // await tx.wait();



  // // pool usdc - usdt
  // fee = 100;
  // txNewPool = await poolFactory.createPool(usdc, usdt, fee);
  // rc = await txNewPool.wait();
  // event = rc.events.find((event) => event.event === "PoolCreated");
  // [token0, token1, fee_, tickSpace, pool] = event.args;
  // Pool = await getContractAt("IPool", pool);
  // console.log("usdc", usdc, "usdt", usdt);
  // console.log("usdc", token0, "usdc", token1);
  // console.log("pool", pool);

  // tx = await Pool.initialize("79207954401793479052443056521");
  // await tx.wait();
  // tickMiddle = -6;
  // amount1Desired = utils.parseUnits("1000000", 6);
  // amount1Desired = utils.parseUnits("1000000", 6);
  // tickLower = tickMiddle - 300;
  // tickUpper = tickMiddle + 300;

  // console.log("Adding liquidity4 wbtc-usdc");
  // mintParams = [
  //   token0,
  //   token1,
  //   fee,
  //   tickLower,
  //   tickUpper,
  //   amount0Desired,
  //   amount1Desired,
  //   1,
  //   1,
  //   deployer,
  //   deadline,
  // ];
  // tx = await positionManager.mint(mintParams);
  // await tx.wait();
  // console.log("done");
};

module.exports.tags = ["tCreatePool", "Test"];
module.exports.dependencies = ["tERC20"];
