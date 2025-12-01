// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TambrDynamicBondingCurve
 * @dev Implements Tambr's Dynamic Bonding Curve (DBC) with virtual reserves (x*y=k model)
 * Supports automated liquidity provision (ALP) to AMM when threshold is reached
 */
contract TambrDynamicBondingCurve is ERC20, Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    IERC20 public baseToken; // IRR Stablecoin
    address public founderAddress; // Address to receive founder's share
    
    // Bonding curve parameters
    uint256 public virtualBaseReserve; // Virtual reserve of base token (IRR)
    uint256 public virtualTokenReserve; // Virtual reserve of this token
    uint256 public realBaseReserve; // Real reserve of base token
    uint256 public realTokenReserve; // Real reserve of this token
    
    address public oracleAddress; // Address of the oracle that updates the dynamic factor
    uint256 public dynamicFactor; // Factor to adjust the virtual reserves for dynamic pricing
    
    // Fee configuration
    uint256 public constant FEE_PERCENTAGE = 800; // 0.8% = 800 basis points
    uint256 public constant FOUNDER_FEE_PERCENTAGE = 100; // 0.1% of fees to founder
    uint256 public constant BASIS_POINTS = 10000; // 100%
    
    // Migration parameters
    uint256 public migrationThreshold; // Base reserve amount to trigger ALP
    bool public isMigrated; // Flag to track if token has migrated to AMM
    address public ammAddress; // Address of AMM pool after migration
    
    // Token creation parameters
    string public tokenSymbol;
    string public tokenDescription;
    string public tokenImageUrl;
    address public tokenCreator;
    uint256 public createdAt;
    
    // ============ Events ============
    
    event TokenCreated(
        address indexed creator,
        string name,
        string symbol,
        uint256 initialVirtualBaseReserve,
        uint256 initialVirtualTokenReserve
    );
    
    event Buy(
        address indexed buyer,
        uint256 baseTokenAmount,
        uint256 tokenAmount,
        uint256 newPrice,
        uint256 founderFee
    );
    
    event Sell(
        address indexed seller,
        uint256 tokenAmount,
        uint256 baseTokenAmount,
        uint256 newPrice,
        uint256 founderFee
    );
    
    event MigratedToAMM(
        address indexed ammAddress,
        uint256 baseTokenAmount,
        uint256 tokenAmount,
        uint256 timestamp
    );
    
    // ============ Constructor ============
    
    constructor(
        string memory name,
        string memory symbol,
        string memory description,
        string memory imageUrl,
        address _baseToken,
        address _founderAddress,
        uint256 _migrationThreshold,
        address _oracleAddress
    ) ERC20(name, symbol) Ownable(msg.sender) {
        baseToken = IERC20(_baseToken);
        founderAddress = _founderAddress;
        tokenSymbol = symbol;
        tokenDescription = description;
        tokenImageUrl = imageUrl;
        tokenCreator = msg.sender;
        createdAt = block.timestamp;
        migrationThreshold = _migrationThreshold;
        oracleAddress = _oracleAddress;
        dynamicFactor = 10000; // Initialize to 100% (10000 basis points)
        
        // Initialize virtual reserves (PumpFun-like)
        // Initial virtual base reserve: 30 IRR (or configurable)
        // Initial virtual token reserve: 1,073,000,000 tokens
        virtualBaseReserve = 30 * 10**18; // 30 IRR with 18 decimals
        virtualTokenReserve = 1_073_000_000 * 10**18; // 1.073B tokens
        
        // Real reserves start at 0
        realBaseReserve = 0;
        realTokenReserve = 0;
        
        // Mint initial supply (800M tokens to bonding curve)
        uint256 initialSupply = 800_000_000 * 10**18;
        _mint(address(this), initialSupply);
        realTokenReserve = initialSupply;
        
        emit TokenCreated(
            msg.sender,
            name,
            symbol,
            virtualBaseReserve,
            virtualTokenReserve
        );
    }
    
    // ============ Oracle Functions ============
    
    /**
     * @dev Allows the oracle to update the dynamic factor.
     * The factor is in basis points (e.g., 10000 = 100%).
     */
    function setDynamicFactor(uint256 _dynamicFactor) public {
        require(msg.sender == oracleAddress, "Only oracle can set factor");
        require(_dynamicFactor > 0, "Factor must be positive");
        dynamicFactor = _dynamicFactor;
    }
    
    // ============ Public Functions ============
    
    /**
     * @dev Buy tokens using base token (IRR)
     * @param baseTokenAmount Amount of base token to spend
     * @param minTokenAmount Minimum tokens to receive (slippage protection)
     */
    function buy(
        uint256 baseTokenAmount,
        uint256 minTokenAmount
    ) public nonReentrant returns (uint256 tokenAmount) {
        require(!isMigrated, "Token has migrated to AMM");
        require(baseTokenAmount > 0, "Amount must be greater than 0");
        
        // Transfer base token from buyer to contract
        require(
            baseToken.transferFrom(msg.sender, address(this), baseTokenAmount),
            "Transfer failed"
        );
        
        // Calculate fees and net base amount
        uint256 totalFee = (baseTokenAmount * FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 founderFee = (totalFee * FOUNDER_FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 netBaseAmount = baseTokenAmount - totalFee;

        // Calculate token amount using x*y=k formula
        tokenAmount = _getTokenAmountForNetBaseAmount(netBaseAmount);
        require(tokenAmount >= minTokenAmount, "Slippage exceeded");
        
        // Update reserves
        virtualBaseReserve += netBaseAmount;
        require(virtualTokenReserve >= tokenAmount, "Virtual token reserve underflow");
        virtualTokenReserve -= tokenAmount;
        realBaseReserve += netBaseAmount;
        require(realTokenReserve >= tokenAmount, "Insufficient real token reserve");
        realTokenReserve -= tokenAmount;
        
        // Transfer tokens to buyer
        require(
            IERC20(this).transfer(msg.sender, tokenAmount),
            "Token transfer failed"
        );
        
        // Transfer founder fee
        if (founderFee > 0) {
            require(
                baseToken.transfer(founderAddress, founderFee),
                "Founder fee transfer failed"
            );
        }
        
        uint256 currentPrice = getCurrentPrice();
        emit Buy(msg.sender, baseTokenAmount, tokenAmount, currentPrice, founderFee);
        
        // Check if migration threshold is reached
        if (realBaseReserve >= migrationThreshold && !isMigrated) {
            _triggerMigration();
        }
        
        return tokenAmount;
    }
    
    /**
     * @dev Sell tokens for base token (IRR)
     * @param tokenAmount Amount of tokens to sell
     * @param minBaseAmount Minimum base tokens to receive (slippage protection)
     */
    function sell(
        uint256 tokenAmount,
        uint256 minBaseAmount
    ) public nonReentrant returns (uint256 netBaseAmount) {
        require(!isMigrated, "Token has migrated to AMM");
        require(tokenAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");
        
        // Transfer tokens from seller to contract
        require(
            IERC20(this).transferFrom(msg.sender, address(this), tokenAmount),
            "Token transfer failed"
        );
        
        // Calculate gross base token amount using x*y=k formula
        uint256 grossBaseAmount = _getBaseAmountForTokenAmount(tokenAmount);
        
        // Calculate fees
        uint256 totalFee = (grossBaseAmount * FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 founderFee = (totalFee * FOUNDER_FEE_PERCENTAGE) / BASIS_POINTS;
        netBaseAmount = grossBaseAmount - totalFee;
        require(netBaseAmount >= minBaseAmount, "Slippage exceeded");

        // Update reserves
        require(virtualBaseReserve >= grossBaseAmount, "Virtual base reserve underflow");
        virtualBaseReserve -= grossBaseAmount;
        virtualTokenReserve += tokenAmount;
        require(realBaseReserve >= netBaseAmount, "Real base reserve underflow");
        realBaseReserve -= netBaseAmount;
        realTokenReserve += tokenAmount;
        
        // Transfer base tokens to seller
        require(
            baseToken.transfer(msg.sender, netBaseAmount),
            "Base token transfer failed"
        );
        
        // Transfer founder fee
        if (founderFee > 0) {
            require(
                baseToken.transfer(founderAddress, founderFee),
                "Founder fee transfer failed"
            );
        }
        
        uint256 currentPrice = getCurrentPrice();
        emit Sell(msg.sender, tokenAmount, grossBaseAmount, currentPrice, founderFee);
        
        return netBaseAmount;
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get current token price in base token
     */
    function getCurrentPrice() public view returns (uint256) {
        if (virtualTokenReserve == 0) return 0;
        return (virtualBaseReserve * 10**18) / virtualTokenReserve;
    }
    
    /**
     * @dev Get bonding curve progress percentage
     */
    function getBondingCurveProgress() public view returns (uint256) {
        uint256 totalTokensToSell = 800_000_000 * 10**18;
        uint256 tokensSold = totalTokensToSell - realTokenReserve;
        return (tokensSold * 100) / totalTokensToSell;
    }
    
    /**
     * @dev Calculate token amount for given net base token amount
     */
    function calculateTokenAmountForBaseAmount(
        uint256 baseTokenAmount
    ) public view returns (uint256 tokenAmount) {
        require(baseTokenAmount > 0, "Amount must be greater than 0");
        uint256 totalFee = (baseTokenAmount * FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 netBaseAmount = baseTokenAmount - totalFee;
        return _getTokenAmountForNetBaseAmount(netBaseAmount);
    }

    /**
     * @dev Calculate net base token amount for given token amount (for selling)
     */
    function calculateBaseAmountForTokenAmount(
        uint256 tokenAmount
    ) public view returns (uint256 netBaseAmount) {
        require(tokenAmount > 0, "Amount must be greater than 0");
        uint256 grossBaseAmount = _getBaseAmountForTokenAmount(tokenAmount);
        uint256 totalFee = (grossBaseAmount * FEE_PERCENTAGE) / BASIS_POINTS;
        return grossBaseAmount - totalFee;
    }

    /**
     * @dev Calculate token amount for given net base token amount
     */
    function _getTokenAmountForNetBaseAmount(
        uint256 netBaseAmount
    ) internal view returns (uint256) {
        // x*y=k formula: tokenAmount = y - (k / (x + netBaseAmount))
        // Apply dynamic factor to virtual base reserve for dynamic pricing
        uint256 adjustedVirtualBaseReserve = (virtualBaseReserve * dynamicFactor) / BASIS_POINTS;
        
        // Use a high precision factor (10**18) to perform the multiplication safely
        uint256 PRECISION = 10**18;
        
        // k = x * y. We multiply first to maintain precision, then divide by PRECISION.
        uint256 k = (adjustedVirtualBaseReserve * virtualTokenReserve) / PRECISION;
        
        uint256 newVirtualBase = adjustedVirtualBaseReserve + netBaseAmount;
        
        // newVirtualToken = k / newVirtualBase. We multiply by PRECISION to compensate for the earlier division.
        uint256 newVirtualToken = (k * PRECISION) / newVirtualBase;
        
        // Prevent underflow
        require(virtualTokenReserve >= newVirtualToken, "Virtual token reserve underflow in calculation");
        return virtualTokenReserve - newVirtualToken;
    }
    
    /**
     * @dev Calculate gross base token amount for given token amount
     */
    function _getBaseAmountForTokenAmount(
        uint256 tokenAmount
    ) internal view returns (uint256) {
        // x*y=k formula: baseAmount = x - (k / (y - tokenAmount))
        // Apply dynamic factor to virtual base reserve for dynamic pricing
        uint256 adjustedVirtualBaseReserve = (virtualBaseReserve * dynamicFactor) / BASIS_POINTS;
        
        // Use a high precision factor (10**18) to perform the multiplication safely
        uint256 PRECISION = 10**18;
        
        // k = x * y. We multiply first to maintain precision, then divide by PRECISION.
        uint256 k = (adjustedVirtualBaseReserve * virtualTokenReserve) / PRECISION;
        
        uint256 newVirtualToken = virtualTokenReserve - tokenAmount;
        
        // newVirtualBase = k / newVirtualToken. We multiply by PRECISION to compensate for the earlier division.
        uint256 newVirtualBase = (k * PRECISION) / newVirtualToken;
        
        // Prevent underflow
        require(newVirtualBase >= adjustedVirtualBaseReserve, "Virtual base reserve underflow in calculation");
        uint256 baseTokenAmount = newVirtualBase - adjustedVirtualBaseReserve;
        
        return baseTokenAmount;
    }
    
    /**
     * @dev Get market cap in base token
     */
    function getMarketCap() public view returns (uint256) {
        uint256 circulatingSupply = 1_000_000_000 * 10**18 - realTokenReserve;
        uint256 price = getCurrentPrice();
        return (circulatingSupply * price) / 10**18;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Trigger migration to AMM when threshold is reached
     */
    function _triggerMigration() internal {
        isMigrated = true;
        // In a real implementation, this would call the AMM contract
        // and deposit liquidity there
        emit MigratedToAMM(
            address(0), // AMM address would be set here
            realBaseReserve,
            realTokenReserve,
            block.timestamp
        );
    }
    
    /**
     * @dev Allow owner to manually trigger migration
     */
    function triggerMigrationManual(address _ammAddress) public onlyOwner {
        require(!isMigrated, "Already migrated");
        ammAddress = _ammAddress;
        _triggerMigration();
    }
    
    /**
     * @dev Withdraw remaining base tokens after migration
     */
    function withdrawAfterMigration() public onlyOwner {
        require(isMigrated, "Not migrated yet");
        uint256 balance = baseToken.balanceOf(address(this));
        require(baseToken.transfer(owner(), balance), "Withdrawal failed");
    }
}
