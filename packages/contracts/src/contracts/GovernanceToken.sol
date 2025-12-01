// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title GovernanceToken
 * @dev ERC-20 governance token for Tambr protocol
 * 10% of total supply allocated to founder at deployment
 */
contract GovernanceToken is ERC20Votes, ERC20Permit {
    address public founderAddress;
    uint256 public constant FOUNDER_ALLOCATION_PERCENTAGE = 10; // 10%
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    event FounderAllocationSet(address indexed founder, uint256 amount);
    
    constructor(address _founderAddress) 
        ERC20("Tambr Governance Token", "TAMBR") 
        ERC20Permit("Tambr Governance Token") 
    {
        require(_founderAddress != address(0), "Invalid founder address");
        
        founderAddress = _founderAddress;
        
        // Allocate 10% to founder and mint directly to them
        uint256 founderAllocation = (TOTAL_SUPPLY * FOUNDER_ALLOCATION_PERCENTAGE) / 100;
        _mint(_founderAddress, founderAllocation);
        
        // Mint the remaining 90% to the token contract itself (or a timelock/governance contract later)
        uint256 remainingSupply = TOTAL_SUPPLY - founderAllocation;
        _mint(address(this), remainingSupply);
        
        // Delegate votes to the founder immediately
        _delegate(_founderAddress, _founderAddress);
        
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

    // The following function is required because ERC20 and ERC20Votes both define it.
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    // ERC20Permit and ERC20Votes both inherit from Nonces, so we must explicitly override.
    // ERC20Permit and ERC20Votes both inherit from Nonces, so we must explicitly override.
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
