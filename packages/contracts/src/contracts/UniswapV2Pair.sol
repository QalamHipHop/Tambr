// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UniswapV2Pair
 * @dev Simplified Uniswap V2 AMM implementation for Tambr
 * Implements constant product formula: x*y=k
 */
contract UniswapV2Pair is ERC20, ReentrancyGuard, Ownable {
    IERC20 public token0; // Base token (IRR)
    IERC20 public token1; // Trading token
    
    uint256 public reserve0; // Reserve of token0
    uint256 public reserve1; // Reserve of token1
    
    uint256 public constant FEE_PERCENTAGE = 300; // 0.3% fee
    uint256 public constant BASIS_POINTS = 100000;
    
    uint256 public kLast; // Last k value for LP fee calculation
    
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint256 reserve0, uint256 reserve1);
    
    constructor(
        address _token0,
        address _token1,
        string memory lpName,
        string memory lpSymbol,
        address initialOwner
    ) ERC20(lpName, lpSymbol) Ownable(initialOwner) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }
    
    /**
     * @dev Add liquidity to the pair
     */
    function mint(address to) public nonReentrant returns (uint256 liquidity) {
        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));
        
        uint256 amount0 = balance0 - reserve0;
        uint256 amount1 = balance1 - reserve1;
        
        uint256 _totalSupply = totalSupply();
        
        if (_totalSupply == 0) {
            liquidity = sqrt(amount0 * amount1) - 1000; // Burn minimum liquidity
        } else {
            liquidity = min(
                (amount0 * _totalSupply) / reserve0,
                (amount1 * _totalSupply) / reserve1
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        
        _mint(to, liquidity);
        _update(balance0, balance1);
        
        kLast = reserve0 * reserve1;
        
        emit Mint(msg.sender, amount0, amount1);
        
        return liquidity;
    }
    
    /**
     * @dev Remove liquidity from the pair
     */
    function burn(address to) public nonReentrant returns (uint256 amount0, uint256 amount1) {
        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));
        
        uint256 liquidity = balanceOf(address(this));
        uint256 _totalSupply = totalSupply();
        
        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;
        
        require(amount0 > 0 && amount1 > 0, "Insufficient liquidity burned");
        
        _burn(address(this), liquidity);
        
        require(token0.transfer(to, amount0), "Token0 transfer failed");
        require(token1.transfer(to, amount1), "Token1 transfer failed");
        
        balance0 = token0.balanceOf(address(this));
        balance1 = token1.balanceOf(address(this));
        
        _update(balance0, balance1);
        
        kLast = reserve0 * reserve1;
        
        emit Burn(msg.sender, amount0, amount1, to);
        
        return (amount0, amount1);
    }
    
    /**
     * @dev Swap tokens
     */
    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to,
        bytes calldata data
    ) public nonReentrant {
        require(amount0Out > 0 || amount1Out > 0, "Insufficient output amount");
        require(amount0Out < reserve0 && amount1Out < reserve1, "Insufficient liquidity");
        
        // Optimistically transfer tokens
        if (amount0Out > 0) require(token0.transfer(to, amount0Out), "Token0 transfer failed");
        if (amount1Out > 0) require(token1.transfer(to, amount1Out), "Token1 transfer failed");
        
        // Get balances after transfers
        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));
        
        // Calculate amounts in
        uint256 amount0In = balance0 > reserve0 - amount0Out ? balance0 - (reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > reserve1 - amount1Out ? balance1 - (reserve1 - amount1Out) : 0;
        
        require(amount0In > 0 || amount1In > 0, "Insufficient input amount");
        
        // Check constant product formula with fee
        uint256 balance0Adjusted = (balance0 * BASIS_POINTS) - (amount0In * FEE_PERCENTAGE);
        uint256 balance1Adjusted = (balance1 * BASIS_POINTS) - (amount1In * FEE_PERCENTAGE);
        
        require(
            balance0Adjusted * balance1Adjusted >= reserve0 * reserve1 * (BASIS_POINTS ** 2),
            "K invariant violated"
        );
        
        _update(balance0, balance1);
        
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
    
    /**
     * @dev Get amount out for given amount in
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (BASIS_POINTS - FEE_PERCENTAGE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * BASIS_POINTS) + amountInWithFee;
        
        amountOut = numerator / denominator;
    }
    
    /**
     * @dev Get amount in for given amount out
     */
    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 amountIn) {
        require(amountOut > 0, "Insufficient output amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 numerator = reserveIn * amountOut * BASIS_POINTS;
        uint256 denominator = (reserveOut - amountOut) * (BASIS_POINTS - FEE_PERCENTAGE);
        
        amountIn = (numerator / denominator) + 1;
    }
    
    // ============ Internal Functions ============
    
    function _update(uint256 balance0, uint256 balance1) internal {
        reserve0 = balance0;
        reserve1 = balance1;
        emit Sync(reserve0, reserve1);
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
