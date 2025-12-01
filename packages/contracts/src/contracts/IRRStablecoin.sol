// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

interface IRedemptionService {
    function requestRedemption(address user, uint256 amount) external returns (bool);
}

/**
 * @title IRRStablecoin
 * @dev ERC-20 stablecoin backed by Iranian Rial (IRR)
 * Supports minting and burning by authorized entities
 */
contract IRRStablecoin is ERC20, ERC20Pausable, AccessControl, ERC2771Context {
    address public redemptionService;
    uint256 public totalFiatReserves; // Mock for total fiat reserves (Item #17)
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REDEMPTION_MANAGER_ROLE = keccak256("REDEMPTION_MANAGER_ROLE");

    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);
    event BurnerAdded(address indexed account);
    event BurnerRemoved(address indexed account);

    constructor(address _trustedForwarder, address _redemptionService) ERC20("IRR Stablecoin", "IRR") ERC2771Context(_trustedForwarder) {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(MINTER_ROLE, _msgSender());
        _grantRole(BURNER_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());
        _grantRole(REDEMPTION_MANAGER_ROLE, _msgSender());
        redemptionService = _redemptionService;
    }

    /**
     * @dev Mint new IRR tokens
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Burn IRR tokens
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }

    /**
     * @dev Allows a user to request redemption of IRR tokens for fiat (Item #6).
     * This burns the tokens and triggers a redemption request on the service contract.
     * @param amount Amount of tokens to redeem.
     */
    function redeem(uint256 amount) public whenNotPaused {
        require(balanceOf(_msgSender()) >= amount, "Insufficient balance");
        
        // 1. Burn the tokens
        _burn(_msgSender(), amount);

        // 2. Request redemption from the service
        require(IRedemptionService(redemptionService).requestRedemption(_msgSender(), amount), "Redemption request failed");
    }

    /**
     * @dev Updates the total fiat reserves (Proof of Reserves - Item #17).
     * This is a mock function for a centralized entity to attest to off-chain reserves.
     * In a real system, this would be a more complex mechanism (e.g., audited reports).
     * @param _newReserves The new total fiat reserve amount.
     */
    function updateFiatReserves(uint256 _newReserves) public onlyRole(REDEMPTION_MANAGER_ROLE) {
        totalFiatReserves = _newReserves;
    }

    /**
     * @dev Returns the current collateralization ratio (Total Reserves / Total Supply).
     */
    function collateralizationRatio() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return 0; // Avoid division by zero
        }
        // Assuming 1:1 peg, ratio is (totalFiatReserves / totalSupply) * 100
        // We return a percentage with 2 decimals (e.g., 10000 for 100.00%)
        return (totalFiatReserves * 10000) / supply;
    }

    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Add a minter role to an account
     */
    function addMinter(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {

        _grantRole(MINTER_ROLE, account);
        emit MinterAdded(account);
    }

    /**
     * @dev Remove minter role from an account
     */
    function removeMinter(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {

        _revokeRole(MINTER_ROLE, account);
        emit MinterRemoved(account);
    }

    /**
     * @dev Add a burner role to an account
     */
    function addBurner(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {

        _grantRole(BURNER_ROLE, account);
        emit BurnerAdded(account);
    }

    /**
     * @dev Remove burner role from an account
     */
    function removeBurner(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        
        _revokeRole(BURNER_ROLE, account);
        emit BurnerRemoved(account);
    }

    /**
     * @dev Add a redemption manager role to an account
     */
    function addRedemptionManager(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(REDEMPTION_MANAGER_ROLE, account);
    }

    /**
     * @dev Remove redemption manager role from an account
     */
    function removeRedemptionManager(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(REDEMPTION_MANAGER_ROLE, account);
    }

    // Required overrides
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, amount);
    }
}
