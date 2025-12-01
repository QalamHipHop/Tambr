// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceToken
 * @dev ERC-20 governance token for Tambr protocol
 * 10% of total supply allocated to founder at deployment
 */
contract GovernanceToken is ERC20, Ownable {
    address public founderAddress;
    uint256 public constant FOUNDER_ALLOCATION_PERCENTAGE = 10; // 10%
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    event FounderAllocationSet(address indexed founder, uint256 amount);
    
    constructor(address _founderAddress) ERC20("Tambr Governance Token", "TAMBR") Ownable(msg.sender) {
        require(_founderAddress != address(0), "Invalid founder address");
        
        founderAddress = _founderAddress;
        
        // Mint total supply
        _mint(address(this), TOTAL_SUPPLY);
        
        // Allocate 10% to founder
        uint256 founderAllocation = (TOTAL_SUPPLY * FOUNDER_ALLOCATION_PERCENTAGE) / 100;
        require(transfer(founderAddress, founderAllocation), "Founder allocation failed");
        
        emit FounderAllocationSet(founderAddress, founderAllocation);
    }
    
    /**
     * @dev Get founder's allocation percentage
     */
    function getFounderAllocationPercentage() public pure returns (uint256) {
        return FOUNDER_ALLOCATION_PERCENTAGE;
    }
    
    /**
     * @dev Get founder's current balance
     */
    function getFounderBalance() public view returns (uint256) {
        return balanceOf(founderAddress);
    }
}
