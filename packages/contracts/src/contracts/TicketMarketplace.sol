// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/IERC2981.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title TicketMarketplace
 * @dev Handles the secondary market trading of SmartTicket NFTs using IRRStablecoin.
 * It enforces platform fees and creator royalties.
 */
contract TicketMarketplace is Ownable {


    // --- State Variables ---
    IERC721 public immutable ticketContract;
IERC2981 public immutable royaltyContract;
    IERC20 public immutable stablecoinContract;
    address public immutable founderAddress;

    // Mapping from tokenId to its listing details
    struct Listing {
        address seller;
        uint256 price; // Price in stablecoin
        bool isListed;
    }
    mapping(uint256 => Listing) public listings;

    // Fees are in basis points (BPS). 10000 BPS = 100%
    uint256 public constant PLATFORM_FEE_BPS = 200; // 2.0% Platform Fee
    uint256 public constant FOUNDER_SHARE_BPS = 20; // 0.2% Founder's Share (0.1% of 2.0% is too small, using 0.2% of total sale)

    // --- Events ---
    event TicketListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event TicketBought(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event ListingCanceled(uint256 indexed tokenId, address indexed seller);
    event FeeDistributed(uint256 indexed tokenId, uint256 platformFee, uint256 founderShare, uint256 creatorRoyalty);

    // --- Constructor ---
    constructor(
        address _ticketContract,
        address _stablecoinContract,
        address _founderAddress
    ) Ownable(msg.sender) {
        require(_ticketContract != address(0), "Invalid ticket contract address");
        require(_stablecoinContract != address(0), "Invalid stablecoin contract address");
        require(_founderAddress != address(0), "Invalid founder address");

        ticketContract = IERC721(_ticketContract);
        royaltyContract = IERC2981(_ticketContract);
        stablecoinContract = IERC20(_stablecoinContract);
        founderAddress = _founderAddress;
    }

    // --- Core Functions ---

    /**
     * @dev Lists a ticket for sale on the marketplace.
     * The seller must have approved the marketplace to transfer the token.
     * @param tokenId The ID of the ticket to list.
     * @param price The sale price in stablecoin.
     */
    function listTicket(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be greater than zero");
        require(ticketContract.ownerOf(tokenId) == msg.sender, "Not the owner of the ticket");
        require(ticketContract.getApproved(tokenId) == address(this), "Marketplace not approved for transfer");
        require(!listings[tokenId].isListed, "Ticket already listed");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isListed: true
        });

        emit TicketListed(tokenId, msg.sender, price);
    }

    /**
     * @dev Buys a listed ticket.
     * The buyer must have approved the marketplace to spend the stablecoin.
     * @param tokenId The ID of the ticket to buy.
     */
    function buyTicket(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.isListed, "Ticket not listed");
        require(listing.seller != msg.sender, "Cannot buy your own ticket");

        uint256 price = listing.price;
        address seller = listing.seller;
        address buyer = msg.sender;

        // 1. Transfer stablecoin from buyer to marketplace
        require(stablecoinContract.transferFrom(buyer, address(this), price), "Stablecoin transfer failed");

        // 2. Calculate and distribute fees/royalties
        uint256 platformFee = (price * PLATFORM_FEE_BPS) / 10000;
        uint256 founderShare = (price * FOUNDER_SHARE_BPS) / 10000;
        
        // EIP-2981 Royalty Calculation (SmartTicket implements ERC2981)
        (address royaltyRecipient, uint256 royaltyAmount) = royaltyContract.royaltyInfo(tokenId, price);
        
        // Ensure total fees do not exceed price
        uint256 totalFees = platformFee + royaltyAmount;
        require(totalFees < price, "Total fees exceed price");

        // 3. Distribute fees
        // Founder's Share (part of the platform fee)
        require(stablecoinContract.transfer(founderAddress, founderShare), "Founder share transfer failed");
        
        // Creator Royalty
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            require(stablecoinContract.transfer(royaltyRecipient, royaltyAmount), "Royalty transfer failed");
        }
        
        // Platform's remaining fee (Owner of the Marketplace)
        uint256 remainingPlatformFee = platformFee - founderShare;
        require(stablecoinContract.transfer(owner(), remainingPlatformFee), "Platform fee transfer failed");

        // 4. Transfer remaining amount to seller
        uint256 amountToSeller = price - totalFees;
        require(stablecoinContract.transfer(seller, amountToSeller), "Seller payment failed");

        // 5. Transfer NFT from seller to buyer
        ticketContract.safeTransferFrom(seller, buyer, tokenId);

        // 6. Clean up listing
        delete listings[tokenId];

        emit TicketBought(tokenId, buyer, seller, price);
        emit FeeDistributed(tokenId, platformFee, founderShare, royaltyAmount);
    }

    /**
     * @dev Cancels a ticket listing. Only callable by the seller.
     * @param tokenId The ID of the ticket to delist.
     */
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.isListed, "Ticket not listed");
        require(listing.seller == msg.sender, "Only the seller can cancel the listing");

        delete listings[tokenId];

        emit ListingCanceled(tokenId, msg.sender);
    }

    // --- Owner Functions ---

    /**
     * @dev Withdraws stablecoin from the contract. Only callable by the owner.
     * This is for withdrawing the platform's share of the fees (which is sent to the owner's address in buyTicket).
     */
    function withdrawStablecoin(uint256 amount) external onlyOwner {
        require(stablecoinContract.transfer(msg.sender, amount), "Withdrawal failed");
    }
}
