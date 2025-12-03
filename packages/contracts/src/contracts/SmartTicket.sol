// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SmartTicket
 * @dev ERC-721 NFT with royalty support (EIP-2981) and Role-Based Access Control (RBAC).
 * Used for event tickets, digital assets, and collectibles.
 */
contract SmartTicket is ERC721, ERC721Enumerable, ERC721Royalty, AccessControl {
    using Strings for uint256;

    // --- Roles ---
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REDEEMER_ROLE = keccak256("REDEEMER_ROLE");

    // --- State Variables ---
    uint256 private _nextTokenId = 1;
    mapping(uint256 => bool) private _redeemed;

    struct TicketDetails {
        uint256 eventId;
        string ticketType;
    }

    mapping(uint256 => TicketDetails) private _ticketDetails;
    
    string public baseURI;
    address public royaltyReceiver;
    uint96 public royaltyPercentage; // In basis points (e.g., 500 = 5%)
    
    // --- Events ---
    event TicketMinted(
        uint256 indexed tokenId,
        address indexed to,
        string uri
    );
    
    event RoyaltyUpdated(
        address indexed receiver,
        uint96 percentage
    );

    event TicketRedeemed(
        uint256 indexed tokenId, 
        address indexed redeemer
    );
    
    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI,
        address _admin,
        address _minter,
        address _redeemer,
        address _royaltyReceiver,
        uint96 _royaltyPercentage
    ) ERC721(name, symbol) {
        // Set the contract deployer as the default admin
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Grant roles to initial addresses
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _minter);
        _grantRole(REDEEMER_ROLE, _redeemer);

        baseURI = _baseURI;
        royaltyReceiver = _royaltyReceiver;
        royaltyPercentage = _royaltyPercentage;
        
        // Set default royalty
        _setDefaultRoyalty(_royaltyReceiver, _royaltyPercentage);
    }
    
    // --- Core Functions ---

    /**
     * @dev Mint a new ticket. Only callable by an address with MINTER_ROLE.
     */
        function mint(address to, uint256 eventId, string memory ticketType) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _ticketDetails[tokenId] = TicketDetails(eventId, ticketType);
        
        emit TicketMinted(tokenId, to, "");
        
        return tokenId;
    }
    
    /**
     * @dev Mint multiple tickets. Only callable by an address with MINTER_ROLE.
     */
        function mintBatch(address to, uint256 quantity, uint256 eventId, string memory ticketType) public onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
        _ticketDetails[tokenId] = TicketDetails(eventId, ticketType);
            tokenIds[i] = tokenId;
            
            emit TicketMinted(tokenId, to, "");
        }
        
        return tokenIds;
    }

    /**
     * @dev Marks a ticket as redeemed (used). Only callable by an address with REDEEMER_ROLE.
     * The ticket must not have been redeemed already.
     */
    function redeemTicket(uint256 tokenId) public onlyRole(REDEEMER_ROLE) {
        // ownerOf reverts if token does not exist
        ownerOf(tokenId);
        require(!_redeemed[tokenId], "SmartTicket: token already redeemed");

        _redeemed[tokenId] = true;
        emit TicketRedeemed(tokenId, msg.sender);
    }

    /**
     * @dev Checks if a ticket has been redeemed.
     */
    function isRedeemed(uint256 tokenId) public view returns (bool) {
        return _redeemed[tokenId];
    }

    /**
     * @dev Returns the details associated with a specific ticket.
     */
    function getTicketDetails(uint256 tokenId) public view returns (uint256 eventId, string memory ticketType) {
        TicketDetails storage details = _ticketDetails[tokenId];
        return (details.eventId, details.ticketType);
    }
    
    // --- Utility Functions ---

    /**
     * @dev Update royalty information. Only callable by an address with DEFAULT_ADMIN_ROLE.
     */
    function setRoyalty(address receiver, uint96 percentage) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(receiver != address(0), "Invalid receiver");
        require(percentage <= 10000, "Percentage too high"); // Max 100%
        
        royaltyReceiver = receiver;
        royaltyPercentage = percentage;
        
        _setDefaultRoyalty(receiver, percentage);
        
        emit RoyaltyUpdated(receiver, percentage);
    }
    
    /**
     * @dev Get next token ID.
     */
    function getNextTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Set base URI. Only callable by an address with DEFAULT_ADMIN_ROLE.
     */
    function setBaseURI(string memory _baseURI) public onlyRole(DEFAULT_ADMIN_ROLE) {
        baseURI = _baseURI;
    }
    
    /**
     * @dev Get token URI.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);
        
        if (bytes(baseURI).length == 0) {
            return "";
        }
        
        // Use Strings.toString() instead of the custom _toString()
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }
    
    // --- Required Overrides ---

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721Royalty, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
