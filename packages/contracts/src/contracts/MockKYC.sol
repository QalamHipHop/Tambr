// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockKYC
 * @dev A mock contract to simulate a KYC/AML whitelisting service.
 * Only the owner can whitelist or blacklist addresses.
 * This is for development and testing purposes only.
 */
contract MockKYC is Ownable {
    mapping(address => bool) public isKYCVerified;

    event AddressVerified(address indexed user);
    event AddressUnverified(address indexed user);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Verifies an address, allowing it to interact with KYC-gated functions.
     * @param _user The address to verify.
     */
    function verifyAddress(address _user) public onlyOwner {
        require(_user != address(0), "Zero address");
        isKYCVerified[_user] = true;
        emit AddressVerified(_user);
    }

    /**
     * @dev Unverifies an address.
     * @param _user The address to unverify.
     */
    function unverifyAddress(address _user) public onlyOwner {
        require(_user != address(0), "Zero address");
        isKYCVerified[_user] = false;
        emit AddressUnverified(_user);
    }

    /**
     * @dev Modifier to restrict access to KYC-verified users.
     */
    modifier onlyKYCVerified() {
        require(isKYCVerified[msg.sender], "KYC not verified");
        _;
    }
}
