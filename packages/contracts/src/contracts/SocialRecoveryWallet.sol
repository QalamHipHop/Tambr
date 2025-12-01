// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SocialRecoveryWallet
 * @dev A simple wallet with social recovery mechanism.
 * The owner can nominate a new owner, and a set of guardians can confirm the change
 * if the owner loses access.
 */
contract SocialRecoveryWallet is Ownable {
    address[] public guardians;
    uint256 public requiredConfirmations;

    // Recovery state
    address public newOwnerCandidate;
    mapping(address => bool) public confirmedGuardians;
    uint256 public confirmationCount;

    event RecoveryNomination(address indexed candidate);
    event RecoveryConfirmation(address indexed guardian);
    event RecoveryExecuted(address indexed oldOwner, address indexed newOwner);

    constructor(address[] memory _guardians, uint256 _requiredConfirmations) Ownable(msg.sender) {
        require(_guardians.length > 0, "Guardians required");
        require(_requiredConfirmations > 0 && _requiredConfirmations <= _guardians.length, "Invalid required confirmations");

        guardians = _guardians;
        requiredConfirmations = _requiredConfirmations;
    }

    // --- Owner Functions ---

    /**
     * @dev Starts the recovery process by nominating a new owner.
     * Can only be called by the current owner.
     * @param _newOwnerCandidate The address to be nominated as the new owner.
     */
    function nominateNewOwner(address _newOwnerCandidate) public onlyOwner {
        require(_newOwnerCandidate != address(0), "Zero address");
        newOwnerCandidate = _newOwnerCandidate;
        confirmationCount = 0;
        // Reset confirmations for all guardians
        for (uint256 i = 0; i < guardians.length; i++) {
            confirmedGuardians[guardians[i]] = false;
        }
        emit RecoveryNomination(_newOwnerCandidate);
    }

    // --- Guardian Functions ---

    /**
     * @dev A guardian confirms the recovery nomination.
     * @param _candidate The address of the nominated new owner.
     */
    function confirmRecovery(address _candidate) public {
        bool isGuardian = false;
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == msg.sender) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Not a guardian");
        require(_candidate == newOwnerCandidate, "Invalid candidate");
        require(newOwnerCandidate != address(0), "No active nomination");
        require(!confirmedGuardians[msg.sender], "Already confirmed");

        confirmedGuardians[msg.sender] = true;
        confirmationCount++;
        emit RecoveryConfirmation(msg.sender);

        if (confirmationCount >= requiredConfirmations) {
            _executeRecovery();
        }
    }

    // --- Internal Functions ---

    /**
     * @dev Executes the recovery, transferring ownership to the new candidate.
     */
    function _executeRecovery() internal {
        address oldOwner = owner();
        _transferOwnership(newOwnerCandidate);
        newOwnerCandidate = address(0); // Clear nomination
        confirmationCount = 0;
        emit RecoveryExecuted(oldOwner, owner());
    }

    // --- Utility Functions ---

    /**
     * @dev Allows the owner to replace a guardian.
     * @param _oldGuardian The guardian to be replaced.
     * @param _newGuardian The new guardian address.
     */
    function replaceGuardian(address _oldGuardian, address _newGuardian) public onlyOwner {
        require(_oldGuardian != _newGuardian, "Same address");
        require(_newGuardian != address(0), "Zero address");

        bool found = false;
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == _oldGuardian) {
                guardians[i] = _newGuardian;
                found = true;
                break;
            }
        }
        require(found, "Old guardian not found");
    }
}
