// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigWallet
 * @dev A simple Multi-signature wallet contract for managing the Treasury.
 * Requires a minimum number of confirmations to execute a transaction.
 */
contract MultiSigWallet {
    event Deposit(address indexed sender, uint256 value);
    event Submission(uint256 indexed transactionId);
    event Confirmation(address indexed owner, uint256 indexed transactionId);
    event Revocation(address indexed owner, uint256 indexed transactionId);
    event Execution(uint256 indexed transactionId);

    mapping(address => bool) public isOwner;
    address[] public owners;
    uint256 public required;

    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
    }

    Transaction[] public transactions;

    mapping(uint256 => mapping(address => bool)) public confirmations;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier notExecuted(uint256 _transactionId) {
        require(!transactions[_transactionId].executed, "Tx already executed");
        _;
    }

    modifier notConfirmed(uint256 _transactionId) {
        require(!confirmations[_transactionId][msg.sender], "Tx already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint256 _required) payable {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required number");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Allows an owner to submit a new transaction.
     * @param _destination The address of the transaction destination.
     * @param _value The amount of Ether to send.
     * @param _data The data to send along with the transaction.
     * @return transactionId The ID of the submitted transaction.
     */
    function submitTransaction(
        address _destination,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner returns (uint256 transactionId) {
        transactionId = transactions.length;
        transactions.push(
            Transaction({
                destination: _destination,
                value: _value,
                data: _data,
                executed: false
            })
        );
        emit Submission(transactionId);
        confirmTransaction(transactionId);
    }

    /**
     * @dev Allows an owner to confirm a transaction.
     * @param _transactionId The ID of the transaction to confirm.
     */
    function confirmTransaction(uint256 _transactionId)
        public
        onlyOwner
        notExecuted(_transactionId)
        notConfirmed(_transactionId)
    {
        confirmations[_transactionId][msg.sender] = true;
        emit Confirmation(msg.sender, _transactionId);

        if (getConfirmationCount(_transactionId) >= required) {
            executeTransaction(_transactionId);
        }
    }

    /**
     * @dev Executes a transaction if it has enough confirmations.
     * @param _transactionId The ID of the transaction to execute.
     */
    function executeTransaction(uint256 _transactionId) public onlyOwner notExecuted(_transactionId) {
        require(getConfirmationCount(_transactionId) >= required, "Not enough confirmations");

        Transaction storage txn = transactions[_transactionId];
        txn.executed = true;

        (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
        require(success, "Tx execution failed");

        emit Execution(_transactionId);
    }

    /**
     * @dev Returns the number of confirmations for a transaction.
     * @param _transactionId The ID of the transaction.
     * @return count The number of confirmations.
     */
    function getConfirmationCount(uint256 _transactionId) public view returns (uint256 count) {
        for (uint256 i = 0; i < owners.length; i++) {
            if (confirmations[_transactionId][owners[i]]) {
                count += 1;
            }
        }
    }
}
