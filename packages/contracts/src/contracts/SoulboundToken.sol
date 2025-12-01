// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SoulboundToken
 * @dev ERC-5192 Soulbound Token - Non-transferable NFT
 * Used for loyalty records, credentials, and achievements
 */
contract SoulboundToken is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    
    string public baseURI;
    
    // Mapping of token ID to metadata
    mapping(uint256 => string) public tokenMetadata;
    
    // Events
    event Issued(
        uint256 indexed tokenId,
        address indexed to,
        string metadata
    );
    
    event Revoked(uint256 indexed tokenId);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory _baseURI
    ) ERC721(name, symbol) {
        baseURI = _baseURI;
    }
    
    /**
     * @dev Issue a soulbound token
     */
    function issue(address to, string memory metadata) public onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        tokenMetadata[tokenId] = metadata;
        
        emit Issued(tokenId, to, metadata);
        
        return tokenId;
    }
    
    /**
     * @dev Revoke a soulbound token
     */
    function revoke(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        _burn(tokenId);
        delete tokenMetadata[tokenId];
        
        emit Revoked(tokenId);
    }
    
    /**
     * @dev Get token metadata
     */
    function getMetadata(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenMetadata[tokenId];
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
    
    /**
     * @dev Override transfer functions to prevent transfers (soulbound)
     */
    function transferFrom(address from, address to, uint256 tokenId)
        public
        override
        pure
    {
        revert("Soulbound tokens cannot be transferred");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId)
        public
        override
        pure
    {
        revert("Soulbound tokens cannot be transferred");
    }
    
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override pure {
        revert("Soulbound tokens cannot be transferred");
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
