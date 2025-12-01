// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title TambrForwarder
 * @dev MinimalForwarder implementation for EIP-2771 meta-transactions.
 * This contract will be the VERIFYING_CONTRACT for the Relayer service.
 */
contract TambrForwarder is EIP712 {
    using ECDSA for bytes32;

    struct ForwardRequest {
        address from;
        address to;
        uint256 value;
        uint256 gas;
        uint256 nonce;
        bytes data;
    }

    bytes32 private constant TYPEHASH =
        keccak256("ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)");

    mapping(address => uint256) private nonces;

    event MetaTransactionExecuted(address indexed from, address indexed to, bytes returnData);

    constructor() EIP712("TambrForwarder", "1") {}

    function getNonce(address from) public view returns (uint256) {
        return nonces[from];
    }

    function verify(ForwardRequest calldata req, bytes calldata signature) public view returns (bool) {
        address signer = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    TYPEHASH,
                    req.from,
                    req.to,
                    req.value,
                    req.gas,
                    req.nonce,
                    keccak256(req.data)
                )
            )
        ).recover(signature);
        return signer == req.from;
    }

    function execute(ForwardRequest calldata req, bytes calldata signature) public payable returns (bool, bytes memory) {
        require(verify(req, signature), "Signature verification failed");
        require(nonces[req.from]++ == req.nonce, "Nonce mismatch");

        (bool success, bytes memory returnData) = req.to.call{gas: req.gas, value: req.value}(req.data);

        emit MetaTransactionExecuted(req.from, req.to, returnData);

        return (success, returnData);
    }
}
