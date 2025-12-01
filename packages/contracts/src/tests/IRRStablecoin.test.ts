import { expect } from "chai";
import { ethers } from "hardhat";

describe("IRRStablecoin", function () {
  let irrStablecoin: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy IRRStablecoin with a dummy forwarder address
    const dummyForwarder = ethers.ZeroAddress;
    const IRRStablecoin = await ethers.getContractFactory("IRRStablecoin");
    irrStablecoin = await IRRStablecoin.deploy(dummyForwarder);
    await irrStablecoin.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await irrStablecoin.name()).to.equal("IRR Stablecoin");
      expect(await irrStablecoin.symbol()).to.equal("IRR");
    });

    it("Should have zero initial supply", async function () {
      expect(await irrStablecoin.totalSupply()).to.equal(0);
    });

    it("Should grant admin role to deployer", async function () {
      const adminRole = await irrStablecoin.DEFAULT_ADMIN_ROLE();
      expect(await irrStablecoin.hasRole(adminRole, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const mintRole = await irrStablecoin.MINTER_ROLE();
      const amount = ethers.parseUnits("1000", 18);

      // Grant minter role to addr1
      await irrStablecoin.addMinter(addr1.address);

      // Mint tokens
      await irrStablecoin.connect(addr1).mint(addr2.address, amount);

      // Check balance
      expect(await irrStablecoin.balanceOf(addr2.address)).to.equal(amount);
    });

    it("Should not allow non-minter to mint tokens", async function () {
      const amount = ethers.parseUnits("1000", 18);

      // Try to mint without minter role
      await expect(
        irrStablecoin.connect(addr1).mint(addr2.address, amount)
      ).to.be.revertedWithCustomError(irrStablecoin, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    it("Should allow burner to burn tokens", async function () {
      const amount = ethers.parseUnits("1000", 18);

      // Mint tokens first
      await irrStablecoin.mint(owner.address, amount);

      // Grant burner role to addr1
      await irrStablecoin.addBurner(addr1.address);

      // Burn tokens
      await irrStablecoin.connect(addr1).burn(owner.address, amount);

      // Check balance
      expect(await irrStablecoin.balanceOf(owner.address)).to.equal(0);
    });

    it("Should not allow non-burner to burn tokens", async function () {
      const amount = ethers.parseUnits("1000", 18);

      // Mint tokens first
      await irrStablecoin.mint(owner.address, amount);

      // Try to burn without burner role
      await expect(
        irrStablecoin.connect(addr1).burn(owner.address, amount)
      ).to.be.revertedWithCustomError(irrStablecoin, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause transfers", async function () {
      const amount = ethers.parseUnits("1000", 18);

      // Mint tokens
      await irrStablecoin.mint(owner.address, amount);

      // Pause
      await irrStablecoin.pause();

      // Try to transfer
      await expect(
        irrStablecoin.transfer(addr1.address, amount)
      ).to.be.revertedWithCustomError(irrStablecoin, "EnforcedPause");
    });

    it("Should allow pauser to unpause transfers", async function () {
      const amount = ethers.parseUnits("1000", 18);

      // Mint tokens
      await irrStablecoin.mint(owner.address, amount);

      // Pause
      await irrStablecoin.pause();

      // Unpause
      await irrStablecoin.unpause();

      // Transfer should work
      await irrStablecoin.transfer(addr1.address, amount);
      expect(await irrStablecoin.balanceOf(addr1.address)).to.equal(amount);
    });
  });
});
