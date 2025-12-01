// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartTicket
 * @dev ERC-721 NFT with royalty support (EIP-2981)
 * Used for event tickets, digital assets, and collectibles
 */
contract SmartTicket is ERC721, ERC721Enumerable, ERC721Royalty, Ownable {
    uint256 private _nextTokenId = 1;
    
    string public baseURI;
    address public royaltyReceiver;
    uint96 public royaltyPercentage; // In basis points (e.g., 500 = 5%)
    
    event TicketMinted(
        uint256 indexed tokenId,
        address indexed to,
        string uri
    );
    
    event RoyaltyUpdated(
        address indexed receiver,
        uint96 percentage
    );
    
    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI,
        address _royaltyReceiver,
        uint96 _royaltyPercentage
    ) ERC721(name, symbol) Ownable(msg.sender) {
        baseURI = _baseURI;
        royaltyReceiver = _royaltyReceiver;
        royaltyPercentage = _royaltyPercentage;
        
        // Set default royalty
        _setDefaultRoyalty(_royaltyReceiver, _royaltyPercentage);
    }
    
    /**
     * @dev Mint a new ticket
     */
    function mint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        emit TicketMinted(tokenId, to, "");
        
        return tokenId;
    }
    
    /**
     * @dev Mint multiple tickets
     */
    function mintBatch(address to, uint256 quantity) public onlyOwner returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
            tokenIds[i] = tokenId;
            
            emit TicketMinted(tokenId, to, "");
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Update royalty information
     */
    function setRoyalty(address receiver, uint96 percentage) public onlyOwner {
        require(receiver != address(0), "Invalid receiver");
        require(percentage <= 10000, "Percentage too high"); // Max 100%
        
        royaltyReceiver = receiver;
        royaltyPercentage = percentage;
        
        _setDefaultRoyalty(receiver, percentage);
        
        emit RoyaltyUpdated(receiver, percentage);
    }
    
    /**
     * @dev Get next token ID
     */
    function getNextTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Set base URI
     */
    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
    
    /**
     * @dev Get token URI
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
        
        return string(abi.encodePacked(baseURI, _toString(tokenId), ".json"));
    }
    
    // Required overrides
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
        override(ERC721, ERC721Enumerable, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Helper function to convert uint to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
