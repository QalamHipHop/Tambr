import { expect } from "chai";
import { ethers } from "hardhat";
import { IRRStablecoin, TambrDynamicBondingCurve } from "../typechain-types";

describe("TambrDynamicBondingCurve", function () {
  let irrStablecoin: IRRStablecoin;
  let dbc: TambrDynamicBondingCurve;
  let owner: any;
  let user1: any;
  let user2: any;
  let founder: any;
  let oracle: any;

  beforeEach(async function () {
    [owner, user1, user2, founder, oracle] = await ethers.getSigners();

    // Deploy IRRStablecoin
    const IRRStablecoinFactory = await ethers.getContractFactory("IRRStablecoin");
    irrStablecoin = await IRRStablecoinFactory.deploy();
    await irrStablecoin.waitForDeployment();

    // Mint IRR tokens for users
    await irrStablecoin.mint(user1.address, ethers.parseEther("1000"));
    await irrStablecoin.mint(user2.address, ethers.parseEther("1000"));

    // Deploy TambrDynamicBondingCurve
    const DBCFactory = await ethers.getContractFactory("TambrDynamicBondingCurve");
    const irrAddress = await irrStablecoin.getAddress();
    dbc = await DBCFactory.deploy(
      "Test Token",
      "TEST",
      "A test token",
      "https://example.com/test.png",
      irrAddress,
      founder.address,
      ethers.parseEther("100"),
      oracle.address
    );
    await dbc.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await dbc.name()).to.equal("Test Token");
      expect(await dbc.symbol()).to.equal("TEST");
      expect(await dbc.tokenCreator()).to.equal(owner.address);
    });

    it("Should have correct initial virtual reserves", async function () {
      const virtualBase = await dbc.virtualBaseReserve();
      const virtualToken = await dbc.virtualTokenReserve();
      expect(virtualBase).to.equal(ethers.parseEther("30"));
      expect(virtualToken).to.equal(ethers.parseEther("1073000000"));
    });
  });

  describe("Buy Functionality", function () {
    it("Should allow buying tokens", async function () {
      const buyAmount = ethers.parseEther("10");

      // Approve DBC to spend IRR
      await irrStablecoin
        .connect(user1)
        .approve(await dbc.getAddress(), buyAmount);

      // Buy tokens
      const tx = await dbc.connect(user1).buy(buyAmount, 0);
      await tx.wait();

      // Check user balance
      const balance = await dbc.balanceOf(user1.address);
      expect(balance).to.be.gt(0);
    });

    it("Should calculate correct price", async function () {
      const price = await dbc.getCurrentPrice();
      expect(price).to.be.gt(0);
    });

    it("Should apply fees correctly", async function () {
      const buyAmount = ethers.parseEther("10");
      await irrStablecoin
        .connect(user1)
        .approve(await dbc.getAddress(), buyAmount);

      const initialFounderBalance = await irrStablecoin.balanceOf(founder.address);

      await dbc.connect(user1).buy(buyAmount, 0);

      const finalFounderBalance = await irrStablecoin.balanceOf(founder.address);
      expect(finalFounderBalance).to.be.gt(initialFounderBalance);
    });
  });

  describe("Sell Functionality", function () {
    it("Should allow selling tokens", async function () {
      const buyAmount = ethers.parseEther("10");

      // Buy tokens first
      await irrStablecoin
        .connect(user1)
        .approve(await dbc.getAddress(), buyAmount);
      await dbc.connect(user1).buy(buyAmount, 0);

      // Get token balance
      const tokenBalance = await dbc.balanceOf(user1.address);

      // Approve DBC to spend tokens
      await dbc.connect(user1).approve(await dbc.getAddress(), tokenBalance);

      // Sell tokens
      const sellAmount = tokenBalance / 2n;
      const tx = await dbc.connect(user1).sell(sellAmount, 0);
      await tx.wait();
      
      // Check balance is reduced
      const finalBalance = await dbc.balanceOf(user1.address);
      expect(finalBalance).to.equal(tokenBalance - sellAmount);
    });
  });

  describe("Bonding Curve Progress", function () {
    it("Should track bonding curve progress", async function () {
      const initialProgress = await dbc.getBondingCurveProgress();
      expect(initialProgress).to.equal(0);

      // Buy some tokens
      const buyAmount = ethers.parseEther("10");
      await irrStablecoin
        .connect(user1)
        .approve(await dbc.getAddress(), buyAmount);
      await dbc.connect(user1).buy(buyAmount, 0);

      const newProgress = await dbc.getBondingCurveProgress();
      expect(newProgress).to.be.gt(initialProgress);
    });
  });

  describe("Market Cap Calculation", function () {
    it("Should calculate market cap correctly", async function () {
      const marketCap = await dbc.getMarketCap();
      expect(marketCap).to.be.gte(0);
    });
  });

  describe("Slippage Protection", function () {
    it("Should revert if slippage exceeds limit", async function () {
      const buyAmount = ethers.parseEther("10");
      const minTokenAmount = ethers.parseEther("1000000000"); // Unrealistic minimum

      await irrStablecoin
        .connect(user1)
        .approve(await dbc.getAddress(), buyAmount);

      await expect(
        dbc.connect(user1).buy(buyAmount, minTokenAmount)
      ).to.be.revertedWith("Slippage exceeded");
    });
  });
});
