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
  const marketplaceOwner = deployer.address; // Marketplace owner will be the deployer (platform)
  console.log("\n2. Deploying GovernanceToken...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy(founderAddress);
  await governanceToken.waitForDeployment();
  const gtAddress = await governanceToken.getAddress();
  console.log("GovernanceToken deployed to:", gtAddress);
  console.log("Founder allocated 10% of TAMBR tokens");

  // 3. Deploy SmartTicket (Updated)
  const SmartTicket = await ethers.getContractFactory("SmartTicket");
  const smartTicket = await SmartTicket.deploy(
    "Tambr Smart Ticket",
    "TICKET",
    "https://api.tambr.io/tickets/",
    marketplaceOwner, // The marketplace owner will be the minter/owner of the ticket contract
    founderAddress, // The founder address is passed to the constructor for the _minter role, which is now the marketplace owner
    500 // 5% royalty
  );
  await smartTicket.waitForDeployment();
  const ticketAddress = await smartTicket.getAddress();
  console.log("SmartTicket deployed to:", ticketAddress);

  // 4. Deploy TicketMarketplace
  console.log("\n4. Deploying TicketMarketplace...");
  const TicketMarketplace = await ethers.getContractFactory("TicketMarketplace");
  const ticketMarketplace = await TicketMarketplace.deploy(
    ticketAddress,
    irrAddress,
    founderAddress
  );
  await ticketMarketplace.waitForDeployment();
  const marketplaceAddress = await ticketMarketplace.getAddress();
  console.log("TicketMarketplace deployed to:", marketplaceAddress);
  console.log("Founder share: 0.2% of secondary market sales");

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

  // AMM and DBC removed.

  // Print summary
  console.log("\n========== DEPLOYMENT SUMMARY ==========");
  console.log("IRRStablecoin:", irrAddress);
  console.log("GovernanceToken:", gtAddress);
  console.log("SmartTicket:", ticketAddress);
  console.log("TicketMarketplace:", marketplaceAddress);
  console.log("SoulboundToken:", sbtAddress);
  console.log("Founder Address:", founderAddress);
  console.log("========================================");

  // Save addresses to file
  const addresses = {
    irrStablecoin: irrAddress,
    governanceToken: gtAddress,
    smartTicket: ticketAddress,
    ticketMarketplace: marketplaceAddress,
    soulboundToken: sbtAddress,
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
