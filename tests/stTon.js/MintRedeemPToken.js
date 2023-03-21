const { expect } = require("chai");
const {
  run,
  network,
  ethers: {
    getContract,
    getContractAt,
    getSigners,
    utils: { parseEther, parseUnits },
    constants: { MaxUint256, NegativeOne, AddressZero },
  },
  deployments,
} = require("hardhat");

const { BigNumber: BN } = require("bignumber.js");

// Constants
const name = "Pooled TON";
const symbol = "piTON";

describe("Mint and redeem StTon", function () {
  let comptroller, unitroller;
  let pTon, stTon, cpTon;
  let deployer, user1, user2;

  before(async function () {
    await deployments.fixture(["Test"]);
    [deployer, user1, user2] = await getSigners();

    const stTonDeployments = await deployments.get("stTon");
    stTon = await getContractAt("StakedTON", stTonDeployments.address);
    const pTonDeployments = await deployments.get("pTon");
    pTon = await getContractAt("PooledTON", pTonDeployments.address);

    const userInitBalace = parseEther("200");
    await stTon.mint(user1.address, userInitBalace);
    await stTon.mint(user2.address, userInitBalace);

    const cpTonDeployments = await deployments.get("cpTon");
    cpTon = await getContractAt("CpTonDelegate", cpTonDeployments.address);

    const userApproveAmount = parseEther("1000");
    await stTon.connect(user1).approve(cpTon.address, userApproveAmount);
    await stTon.connect(user2).approve(cpTon.address, userApproveAmount);
  });

  describe("stTon interaction with cpTon", function () {
    it("Should return correct init user stTon balance", async function () {
      const initBalance = parseEther("200");
      const user1Bal = await stTon.balanceOf(user1.address);
      const user2Bal = await stTon.balanceOf(user2.address);
      expect(user1Bal).equal(initBalance);
      expect(user2Bal).equal(initBalance);
    });

    it("cpTon has correct balance after minting stTon", async function () {
      const mintAmount = parseEther("100");
      await cpTon.connect(user1).mintSt(mintAmount);

      expect(await pTon.balanceOf(cpTon.address)).equal(mintAmount);
      expect(await stTon.balanceOf(user1.address)).equal(mintAmount);
    });

    it("cpTon has correct balance after user2 minting stTon", async function () {
      const user1mintAmount = await pTon.balanceOf(cpTon.address);
      const mintAmount = parseEther("100");
      await cpTon.connect(user2).mintSt(mintAmount);

      expect(await pTon.balanceOf(cpTon.address)).equal(
        mintAmount.add(user1mintAmount)
      );
    });

    it("Unable to redeem more than user balance", async function () {
      const cpTonUserBalance = await cpTon.balanceOf(user1.address);

      await expect(cpTon.connect(user1).redeemSt(cpTonUserBalance.add(1))).to.be
        .reverted;
    });

    it("User1 redeems stTon", async function () {
      const cpTonUserBalance = await cpTon.balanceOf(user1.address);

      // const userBalanceBefore = await stTon.balanceOf(user1.address);
      // const cpTonBalance = await stTon.balanceOf(pTon.address);
      // const totalBalance = userBalanceBefore.add(cpTonBalance);

      await cpTon.connect(user1).redeemSt(cpTonUserBalance);

      expect(await stTon.balanceOf(user1.address)).equal(parseEther("200"));
    });

    it("User2 redeems stTon", async function () {
      const cpTonUserBalance = await cpTon.balanceOf(user2.address);

      // const userBalanceBefore = await stTon.balanceOf(user1.address);
      // const cpTonBalance = await stTon.balanceOf(pTon.address);
      // const totalBalance = userBalanceBefore.add(cpTonBalance);

      await cpTon.connect(user2).redeemSt(cpTonUserBalance);

      expect(await stTon.balanceOf(user2.address)).equal(parseEther("200"));
    });

    it("All cpTon are burned", async function () {
      expect(await cpTon.totalSupply()).equal(0);
    });

    it("user1 deposits 0.1 stTon", async function () {
      const mintAmount = parseUnits("10.0", 9);
      await cpTon.connect(user1).mintSt(mintAmount);
      console.log("cpUserBalance:", await cpTon.balanceOf(user1.address));
      // expect(await cpTon.totalSupply()).equal(0);
    });
  });
});
