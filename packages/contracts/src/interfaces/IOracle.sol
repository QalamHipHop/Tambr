// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOracle
 * @dev Interface for the Tambr Dynamic Factor Oracle
 */
interface IOracle {
    /**
     * @dev Returns the current dynamic factor in basis points (e.g., 10000 = 100%).
     */
    function getDynamicFactor() external view returns (uint256);
}
