// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IOracle.sol";

/**
 * @title TambrDynamicFactorOracle
 * @dev A basic implementation of the IOracle interface for the Tambr project.
 * The factor is in basis points (e.g., 10000 = 100%).
 * In a real-world scenario, this would be connected to an off-chain data feed.
 */
contract TambrDynamicFactorOracle is Ownable, IOracle {
    uint256 private _dynamicFactor;
    uint256 public constant BASIS_POINTS = 10000;

    constructor(uint256 initialFactor) Ownable(msg.sender) {
        require(initialFactor > 0, "Factor must be positive");
        _dynamicFactor = initialFactor;
    }

    /**
     * @inheritdoc IOracle
     */
    function getDynamicFactor() external view override returns (uint256) {
        return _dynamicFactor;
    }

    /**
     * @dev Allows the owner to update the dynamic factor.
     * @param newFactor The new factor in basis points.
     */
    function setDynamicFactor(uint256 newFactor) public onlyOwner {
        require(newFactor > 0, "Factor must be positive");
        _dynamicFactor = newFactor;
    }
}
