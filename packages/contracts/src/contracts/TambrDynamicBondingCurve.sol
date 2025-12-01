// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";


/**
 * @title TambrDynamicBondingCurve
 * @dev Implements the Dynamic Bonding Curve logic for the IRRStablecoin.
 * The curve is based on a simple linear model for demonstration, with a founder fee mechanism.
 * The actual complex mathematical logic for the DBC needs to be fully implemented.
 */
contract TambrDynamicBondingCurve is Ownable, Pausable {
    IERC20 public immutable stablecoin;
    address public treasury;
    uint256 public founderFeeRate; // e.g., 500 for 5% (500 / 10000)
    uint256 public constant FEE_DENOMINATOR = 10000;

    // Total supply of stablecoin in the curve's reserve
    uint256 public reserveBalance;

    event Buy(address indexed buyer, uint256 amountIn, uint256 tokensOut, uint256 founderFee);
    event Sell(address indexed seller, uint256 tokensIn, uint256 amountOut, uint256 founderFee);
    event TreasuryUpdated(address newTreasury);
    event FounderFeeRateUpdated(uint256 newRate);

    constructor(address _stablecoin, address _treasury, uint256 _founderFeeRate, address _trustedForwarder) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        treasury = _treasury;
        founderFeeRate = _founderFeeRate;
    }

    /**
     * @dev Sets the address of the treasury contract (Multi-sig).
     * @param _newTreasury The new treasury address.
     */
    function setTreasury(address _newTreasury) public onlyOwner {
        
        require(_newTreasury != address(0), "Zero address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    /**
     * @dev Sets the founder fee rate.
     * @param _newRate The new rate (e.g., 500 for 5%).
     */
    function setFounderFeeRate(uint256 _newRate) public onlyOwner {
        
        require(_newRate < FEE_DENOMINATOR, "Rate too high");
        founderFeeRate = _newRate;
        emit FounderFeeRateUpdated(_newRate);
    }

    /// @dev Emergency pause function. Only callable by the owner.
    function pause() public onlyOwner {
        _pause();
    }

    /// @dev Emergency unpause function. Only callable by the owner.
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Calculates the amount of stablecoin tokens received for a given amount of collateral (e.g., ETH/WETH).
     * @param _amountIn The amount of collateral being sent.
     * @return tokensOut The amount of stablecoin tokens to be minted.
     * @return feeAmount The founder fee amount.
     */
    function calculateBuyReturn(uint256 _amountIn) public view returns (uint256 tokensOut, uint256 feeAmount) {
        // Simple linear curve: price increases with supply
        // Price = (reserveBalance / 1e18) * slope + initialPrice
        // This is a simplified example. A real implementation would be more complex.
        uint256 price = (reserveBalance / 1e18) * 100 + 1e18; // price starts at 1 and increases
        tokensOut = (_amountIn * 1e18) / price;
        
        uint256 totalFee = (tokensOut * founderFeeRate) / FEE_DENOMINATOR;
        tokensOut = tokensOut - totalFee;
        feeAmount = totalFee;
    }

    /**
     * @dev Allows users to buy stablecoin tokens by sending collateral.
     * The collateral is assumed to be sent in the transaction (e.g., ETH or WETH via a wrapper).
     * For this example, we assume the collateral is the stablecoin itself for simplicity in a single-token curve.
     * In a real scenario, this would be a different token (e.g., WETH or a base token).
     * @param _amountIn The amount of collateral (e.g., WETH) to spend.
     * @param _minTokensOut The minimum amount of stablecoin tokens the buyer is willing to receive.
     */
    function buy(uint256 _amountIn, uint256 _minTokensOut) public whenNotPaused {
        (uint256 tokensOut, uint256 feeAmount) = calculateBuyReturn(_amountIn);
        require(tokensOut >= _minTokensOut, "Slippage too high");

        // Transfer collateral to the contract (reserve)
        // In a real scenario, this would be a transfer of the collateral token
        // For this example, we assume the stablecoin is the collateral for simplicity
        require(stablecoin.transferFrom(msg.sender, address(this), _amountIn), "Collateral transfer failed");
        
        // Transfer founder fee to the treasury
        require(stablecoin.transfer(treasury, feeAmount), "Fee transfer failed");
        
        // Mint stablecoin tokens to the buyer
        // This requires the stablecoin contract to have a minting function callable by this contract
        // We assume the stablecoin contract has a mint function for now.
        // stablecoin.mint(msg.sender, tokensOut); 
        
        reserveBalance += (_amountIn - feeAmount);

        emit Buy(msg.sender, _amountIn, tokensOut, feeAmount);
    }

    /**
     * @dev Calculates the amount of collateral received for a given amount of stablecoin tokens.
     * @param _tokensIn The amount of stablecoin tokens being sold.
     * @return amountOut The amount of collateral (e.g., WETH) to be returned.
     * @return feeAmount The founder fee amount.
     */
    function calculateSellReturn(uint256 _tokensIn) public view returns (uint256 amountOut, uint256 feeAmount) {
        // Simple linear curve: price decreases with supply
        uint256 price = (reserveBalance / 1e18) * 100 + 1e18;
        amountOut = (_tokensIn * price) / 1e18;

        uint256 totalFee = (amountOut * founderFeeRate) / FEE_DENOMINATOR;
        amountOut = amountOut - totalFee;
        feeAmount = totalFee;
    }

    /**
     * @dev Allows users to sell stablecoin tokens for collateral.
     * @param _tokensIn The amount of stablecoin tokens to sell.
     * @param _minAmountOut The minimum amount of collateral the seller is willing to receive.
     */
    function sell(uint256 _tokensIn, uint256 _minAmountOut) public whenNotPaused {
        (uint256 amountOut, uint256 feeAmount) = calculateSellReturn(_tokensIn);
        require(amountOut >= _minAmountOut, "Slippage too high");

        // Burn stablecoin tokens from the seller
        // This requires the stablecoin contract to have a burn function callable by this contract
        // stablecoin.burn(msg.sender, _tokensIn);
        
        // Transfer founder fee to the treasury
        require(stablecoin.transfer(treasury, feeAmount), "Fee transfer failed");
        
        // Transfer collateral from the reserve to the seller
        // In a real scenario, this would be a transfer of the collateral token
        require(stablecoin.transfer(msg.sender, amountOut), "Collateral transfer failed");
        
        reserveBalance -= amountOut;

        emit Sell(msg.sender, _tokensIn, amountOut, feeAmount);
    }
}