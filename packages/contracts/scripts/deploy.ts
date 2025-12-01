import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Tambr contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy IRRStablecoin
  console.log("\n1. Deploying IRRStablecoin...");
  const IRRStablecoin = await ethers.getContractFactory("IRRStablecoin");
  const irrStablecoin = await IRRStablecoin.deploy();
  await irrStablecoin.waitForDeployment();
  const irrAddress = await irrStablecoin.getAddress();
  console.log("IRRStablecoin deployed to:", irrAddress);

  // 2. Deploy GovernanceToken with founder address
  const founderAddress = process.env.FOUNDER_ADDRESS || deployer.address;
  const oracleAddress = process.env.ORACLE_ADDRESS || deployer.address; // Use deployer as mock oracle
  console.log("\n2. Deploying GovernanceToken...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy(founderAddress);
  await governanceToken.waitForDeployment();
  const gtAddress = await governanceToken.getAddress();
  console.log("GovernanceToken deployed to:", gtAddress);
  console.log("Founder allocated 10% of TAMBR tokens");

  // 3. Deploy DynamicBondingCurve
  console.log("\n3. Deploying DynamicBondingCurve...");
  const TambrDynamicBondingCurve = await ethers.getContractFactory(
    "TambrDynamicBondingCurve"
  );

  // Example parameters for a test token
  const dbcParams = {
    name: "Test Token",
    symbol: "TEST",
    description: "A test token on Tambr",
    imageUrl: "https://example.com/test.png",
    baseToken: irrAddress,
    founderAddress: founderAddress,
    migrationThreshold: ethers.parseEther("100"), // 100 IRR threshold
    oracleAddress: oracleAddress,
  };

  const dbc = await TambrDynamicBondingCurve.deploy(
    dbcParams.name,
    dbcParams.symbol,
    dbcParams.description,
    dbcParams.imageUrl,
    dbcParams.baseToken,
    dbcParams.founderAddress,
    dbcParams.migrationThreshold,
    dbcParams.oracleAddress
  );
  await dbc.waitForDeployment();
  const dbcAddress = await dbc.getAddress();
  console.log("TambrDynamicBondingCurve deployed to:", dbcAddress);
  console.log("Founder fee: 0.1% of 0.8% transaction fee");

  // 4. Deploy SmartTicket
  console.log("\n4. Deploying SmartTicket...");
  const SmartTicket = await ethers.getContractFactory("SmartTicket");
  const smartTicket = await SmartTicket.deploy(
    "Tambr Smart Ticket",
    "TICKET",
    "https://api.tambr.io/tickets/",
    founderAddress,
    500 // 5% royalty
  );
  await smartTicket.waitForDeployment();
  const ticketAddress = await smartTicket.getAddress();
  console.log("SmartTicket deployed to:", ticketAddress);

  // 5. Deploy SoulboundToken
  console.log("\n5. Deploying SoulboundToken...");
  const SoulboundToken = await ethers.getContractFactory("SoulboundToken");
  const soulboundToken = await SoulboundToken.deploy(
    "Tambr Soulbound Token",
    "SBT",
    "https://api.tambr.io/sbt/"
  );
  await soulboundToken.waitForDeployment();
  const sbtAddress = await soulboundToken.getAddress();
  console.log("SoulboundToken deployed to:", sbtAddress);

  // 6. Deploy UniswapV2Pair (AMM)
  console.log("\n6. Deploying UniswapV2Pair (AMM)...");
  const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
  const ammPair = await UniswapV2Pair.deploy(
    irrAddress,
    dbcAddress,
    "Tambr LP",
    "TAMBR-LP",
    deployer.address // Initial owner for the AMM pair
  );
  await ammPair.waitForDeployment();
  const ammAddress = await ammPair.getAddress();
  console.log("UniswapV2Pair deployed to:", ammAddress);

  // Print summary
  console.log("\n========== DEPLOYMENT SUMMARY ==========");
  console.log("IRRStablecoin:", irrAddress);
  console.log("GovernanceToken:", gtAddress);
  console.log("DynamicBondingCurve:", dbcAddress);
  console.log("SmartTicket:", ticketAddress);
  console.log("SoulboundToken:", sbtAddress);
  console.log("UniswapV2Pair (AMM):", ammAddress);
  console.log("Founder Address:", founderAddress);
  console.log("========================================");

  // Save addresses to file
  const addresses = {
    irrStablecoin: irrAddress,
    governanceToken: gtAddress,
    dynamicBondingCurve: dbcAddress,
    oracleAddress: oracleAddress,
    smartTicket: ticketAddress,
    soulboundToken: sbtAddress,
    ammPair: ammAddress,
    founder: founderAddress,
    deployer: deployer.address,
  };

  const fs = await import("fs");
  fs.writeFileSync(
    "deployment-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nAddresses saved to deployment-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
