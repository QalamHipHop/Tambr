import { expect } from "chai";
import { ethers } from "hardhat";

describe("TambrDynamicBondingCurve", function () {
  let dbc: any;
  let stablecoin: any;
  let owner: any;
  let treasury: any;
  let addr1: any;

  beforeEach(async function () {
    // Get signers
    [owner, treasury, addr1] = await ethers.getSigners();

    // Deploy IRRStablecoin first
    const dummyForwarder = ethers.ZeroAddress;
    const IRRStablecoin = await ethers.getContractFactory("IRRStablecoin");
    stablecoin = await IRRStablecoin.deploy(dummyForwarder);
    await stablecoin.waitForDeployment();

    // Deploy TambrDynamicBondingCurve
    const founderFeeRate = 500; // 5%
    const TambrDynamicBondingCurve = await ethers.getContractFactory("TambrDynamicBondingCurve");
    dbc = await TambrDynamicBondingCurve.deploy(
      await stablecoin.getAddress(),
      treasury.address,
      founderFeeRate,
      dummyForwarder
    );
    await dbc.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct treasury address", async function () {
      expect(await dbc.treasury()).to.equal(treasury.address);
    });

    it("Should set the correct founder fee rate", async function () {
      expect(await dbc.founderFeeRate()).to.equal(500);
    });

    it("Should have zero initial reserve balance", async function () {
      expect(await dbc.reserveBalance()).to.equal(0);
    });
  });

  describe("calculateBuyReturn", function () {
    it("Should calculate correct buy return with fee", async function () {
      const amountIn = ethers.parseUnits("1000", 18);
      const [tokensOut, feeAmount] = await dbc.calculateBuyReturn(amountIn);

      // Expected: 1000 - (1000 * 500 / 10000) = 950
      const expectedTokens = ethers.parseUnits("950", 18);
      const expectedFee = ethers.parseUnits("50", 18);

      expect(tokensOut).to.equal(expectedTokens);
      expect(feeAmount).to.equal(expectedFee);
    });
  });

  describe("calculateSellReturn", function () {
    it("Should calculate correct sell return with fee", async function () {
      const tokensIn = ethers.parseUnits("1000", 18);
      const [amountOut, feeAmount] = await dbc.calculateSellReturn(tokensIn);

      // Expected: 1000 - (1000 * 500 / 10000) = 950
      const expectedAmount = ethers.parseUnits("950", 18);
      const expectedFee = ethers.parseUnits("50", 18);

      expect(amountOut).to.equal(expectedAmount);
      expect(feeAmount).to.equal(expectedFee);
    });
  });

  describe("setTreasury", function () {
    it("Should allow owner to set new treasury", async function () {
      const newTreasury = addr1.address;
      await dbc.setTreasury(newTreasury);
      expect(await dbc.treasury()).to.equal(newTreasury);
    });

    it("Should not allow non-owner to set treasury", async function () {
      await expect(
        dbc.connect(addr1).setTreasury(addr1.address)
      ).to.be.revertedWith("Ownable");
    });

    it("Should not allow setting zero address as treasury", async function () {
      await expect(
        dbc.setTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });
  });

  describe("setFounderFeeRate", function () {
    it("Should allow owner to set new founder fee rate", async function () {
      const newRate = 1000; // 10%
      await dbc.setFounderFeeRate(newRate);
      expect(await dbc.founderFeeRate()).to.equal(newRate);
    });

    it("Should not allow non-owner to set founder fee rate", async function () {
      await expect(
        dbc.connect(addr1).setFounderFeeRate(1000)
      ).to.be.revertedWith("Ownable");
    });

    it("Should not allow setting fee rate >= 100%", async function () {
      await expect(
        dbc.setFounderFeeRate(10000)
      ).to.be.revertedWith("Rate too high");
    });
  });
});
