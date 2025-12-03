import { expect } from "chai";
import { ethers } from "hardhat";
import { SmartTicket } from "../typechain-types";

describe("SmartTicket", function () {
    let SmartTicket: SmartTicket;
    let owner: any;
    let admin: any;
    let minter: any;
    let redeemer: any;
    let user1: any;
    let user2: any;

    const NAME = "Event Ticket";
    const SYMBOL = "ETK";
    const BASE_URI = "https://api.example.com/tickets/";
    const ROYALTY_PERCENTAGE = 500; // 5%

    beforeEach(async function () {
        [owner, admin, minter, redeemer, user1, user2] = await ethers.getSigners();

        const SmartTicketFactory = await ethers.getContractFactory("SmartTicket");
        SmartTicket = await SmartTicketFactory.deploy(
            NAME,
            SYMBOL,
            BASE_URI,
            admin.address,
            minter.address,
            redeemer.address,
            owner.address, // Royalty Receiver
            ROYALTY_PERCENTAGE
        );
        await SmartTicket.waitForDeployment();
    });

    describe("Deployment and Roles", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await SmartTicket.name()).to.equal(NAME);
            expect(await SmartTicket.symbol()).to.equal(SYMBOL);
        });

        it("Should assign roles correctly", async function () {
            const DEFAULT_ADMIN_ROLE = await SmartTicket.DEFAULT_ADMIN_ROLE();
            const MINTER_ROLE = await SmartTicket.MINTER_ROLE();
            const REDEEMER_ROLE = await SmartTicket.REDEEMER_ROLE();

            // Deployer (owner) gets DEFAULT_ADMIN_ROLE
            expect(await SmartTicket.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
            // Admin gets DEFAULT_ADMIN_ROLE
            expect(await SmartTicket.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
            // Minter gets MINTER_ROLE
            expect(await SmartTicket.hasRole(MINTER_ROLE, minter.address)).to.be.true;
            // Redeemer gets REDEEMER_ROLE
            expect(await SmartTicket.hasRole(REDEEMER_ROLE, redeemer.address)).to.be.true;
        });

        it("Should set the correct royalty info", async function () {
            const [receiver, amount] = await SmartTicket.royaltyInfo(1, 10000);
            expect(receiver).to.equal(owner.address);
            expect(amount).to.equal(500); // 5% of 10000
        });
    });

    describe("Minting", function () {
        const EVENT_ID = 101;
        const TICKET_TYPE = "VIP";

        it("Should allow MINTER_ROLE to mint a single ticket", async function () {
            await expect(SmartTicket.connect(minter).mint(user1.address, EVENT_ID, TICKET_TYPE))
                .to.emit(SmartTicket, "TicketMinted")
                .withArgs(1, user1.address, "");
            
            expect(await SmartTicket.ownerOf(1)).to.equal(user1.address);
            expect(await SmartTicket.balanceOf(user1.address)).to.equal(1);
            
            const [eventId, ticketType] = await SmartTicket.getTicketDetails(1);
            expect(eventId).to.equal(EVENT_ID);
            expect(ticketType).to.equal(TICKET_TYPE);
        });

        it("Should allow MINTER_ROLE to mint a batch of tickets", async function () {
            const quantity = 3;
            await expect(SmartTicket.connect(minter).mintBatch(user2.address, quantity, EVENT_ID, TICKET_TYPE))
                .to.not.be.reverted;
            
            expect(await SmartTicket.balanceOf(user2.address)).to.equal(quantity);
            expect(await SmartTicket.ownerOf(1)).to.equal(user2.address);
            expect(await SmartTicket.ownerOf(2)).to.equal(user2.address);
            expect(await SmartTicket.ownerOf(3)).to.equal(user2.address);

            const [eventId, ticketType] = await SmartTicket.getTicketDetails(3);
            expect(eventId).to.equal(EVENT_ID);
            expect(ticketType).to.equal(TICKET_TYPE);
        });

        it("Should prevent non-MINTER_ROLE from minting", async function () {
            const MINTER_ROLE = await SmartTicket.MINTER_ROLE();
            await expect(SmartTicket.connect(user1).mint(user1.address, EVENT_ID, TICKET_TYPE))
                .to.be.revertedWithCustomError(SmartTicket, "AccessControlUnauthorizedAccount")
                .withArgs(user1.address, MINTER_ROLE);
        });
    });

    describe("Redemption", function () {
        const EVENT_ID = 101;
        const TICKET_TYPE = "General";
        const TOKEN_ID = 1;

        beforeEach(async function () {
            await SmartTicket.connect(minter).mint(user1.address, EVENT_ID, TICKET_TYPE);
        });

        it("Should allow REDEEMER_ROLE to redeem a ticket", async function () {
            expect(await SmartTicket.isRedeemed(TOKEN_ID)).to.be.false;

            await expect(SmartTicket.connect(redeemer).redeemTicket(TOKEN_ID))
                .to.emit(SmartTicket, "TicketRedeemed")
                .withArgs(TOKEN_ID, redeemer.address);
            
            expect(await SmartTicket.isRedeemed(TOKEN_ID)).to.be.true;
        });

        it("Should prevent redeeming an already redeemed ticket", async function () {
            await SmartTicket.connect(redeemer).redeemTicket(TOKEN_ID);
            
            await expect(SmartTicket.connect(redeemer).redeemTicket(TOKEN_ID))
                .to.be.revertedWith("SmartTicket: token already redeemed");
        });

        it("Should prevent non-REDEEMER_ROLE from redeeming", async function () {
            const REDEEMER_ROLE = await SmartTicket.REDEEMER_ROLE();
            await expect(SmartTicket.connect(user1).redeemTicket(TOKEN_ID))
                .to.be.revertedWithCustomError(SmartTicket, "AccessControlUnauthorizedAccount")
                .withArgs(user1.address, REDEEMER_ROLE);
        });
    });

    describe("URI and Metadata", function () {
        const EVENT_ID = 101;
        const TICKET_TYPE = "General";
        const TOKEN_ID = 1;

        beforeEach(async function () {
            await SmartTicket.connect(minter).mint(user1.address, EVENT_ID, TICKET_TYPE);
        });

        it("Should return the correct token URI", async function () {
            const expectedURI = BASE_URI + TOKEN_ID.toString() + ".json";
            expect(await SmartTicket.tokenURI(TOKEN_ID)).to.equal(expectedURI);
        });

        it("Should allow admin to update base URI", async function () {
            const NEW_BASE_URI = "https://new.example.com/tickets/";
            await SmartTicket.connect(admin).setBaseURI(NEW_BASE_URI);
            
            const expectedURI = NEW_BASE_URI + TOKEN_ID.toString() + ".json";
            expect(await SmartTicket.tokenURI(TOKEN_ID)).to.equal(expectedURI);
        });
    });
});
