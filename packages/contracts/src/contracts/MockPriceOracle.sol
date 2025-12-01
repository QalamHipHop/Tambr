// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockPriceOracle
 * @dev A mock contract to simulate a Chainlink or other price feed for Rial/USD.
 * This is for development and testing purposes only.
 */
contract MockPriceOracle is Ownable {
    // Price is stored as USD per Rial, with 8 decimals (typical for Chainlink)
    // e.g., 1 USD = 420000 Rial -> 1 Rial = 1/420000 USD = 0.00000238 USD
    // We will store the price of 1 USD in Rial, e.g., 420,000,000,000,000,000,000 (420,000 * 1e18)
    // For simplicity, let's store the price of 1 IRR in USD with 8 decimals.
    // 1 IRR = 0.00000238 USD. Let's use a simpler representation: 1 USD = 42,000 IRR.
    // We will store the price of 1 USD in IRR, with 8 decimals.
    // Let's use a fixed-point number for simplicity, representing the price of 1 IRR in USD.
    // Price of 1 IRR in USD, with 8 decimals.
    uint256 public constant DECIMALS = 8;
    uint256 public priceIRRinUSD; // e.g., 238 for 0.00000238 USD

    event PriceUpdated(uint256 newPrice);

    constructor(uint256 _initialPrice) Ownable(msg.sender) {
        priceIRRinUSD = _initialPrice;
    }

    /**
     * @dev Updates the mock price. Only callable by the owner.
     * @param _newPrice The new price of 1 IRR in USD, with 8 decimals.
     */
    function updatePrice(uint256 _newPrice) public onlyOwner {
        priceIRRinUSD = _newPrice;
        emit PriceUpdated(_newPrice);
    }

    /**
     * @dev Returns the latest price data.
     * @return roundId The round ID (mocked).
     * @return answer The price of 1 IRR in USD (8 decimals).
     * @return startedAt The timestamp when the round started (mocked).
     * @return updatedAt The timestamp when the price was last updated.
     * @return answeredInRound The round ID (mocked).
     */
    function latestRoundData()
        public
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            1,
            int256(priceIRRinUSD),
            block.timestamp,
            block.timestamp,
            1
        );
    }
}
