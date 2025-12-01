import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

// Define the EIP-712 domain and types for the meta-transaction
const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

const ForwardRequest = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'data', type: 'bytes' },
];

@Injectable()
export class RelayerService {
  private readonly logger = new Logger(RelayerService.name);
  private wallet!: ethers.Wallet;
  private provider!: ethers.JsonRpcProvider;
  private readonly RELAYER_ADDRESS: string;
  private readonly CHAIN_ID: number;
  private readonly VERIFYING_CONTRACT: string; // Address of the contract that verifies the signature (e.g., a GSN Forwarder)

  constructor() {
    this.CHAIN_ID = parseInt(process.env.CHAIN_ID || '31337'); // Hardhat default
    this.RELAYER_ADDRESS = process.env.RELAYER_ADDRESS || '0x...'; // Relayer address is derived from private key
    this.VERIFYING_CONTRACT = process.env.VERIFYING_CONTRACT || '0x...'; // Address of the deployed TambrForwarder contract

    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;

    if (!privateKey || !rpcUrl) {
      this.logger.error('RELAYER_PRIVATE_KEY or RPC_URL not set in environment variables.');
      // In a real app, you might throw an error or handle this more gracefully
    } else {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.logger.log(`Relayer initialized with address: ${this.wallet.address}`);
    }
  }

  /**
   * Verifies the EIP-712 signature and sends the meta-transaction.
   * @param request The EIP-712 request object.
   * @param signature The signature from the user.
   * @returns The transaction hash.
   */
  async relayTransaction(request: any, signature: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Relayer not properly initialized.');
    }

    // 1. Construct the EIP-712 data
    const domain = {
      name: 'TambrForwarder', // Should match the name in the verifying contract
      version: '1',
      chainId: this.CHAIN_ID,
      verifyingContract: this.VERIFYING_CONTRACT,
    };

    const types = {
      EIP712Domain,
      ForwardRequest,
    };

    // 2. Verify the signature (off-chain check for security)
    // In a full implementation, you would use the verifying contract's `verify` function
    // to check if the signature is valid for the request.
    // 2. Off-chain verification (optional but recommended to save gas on invalid signatures)
    const forwarderVerifyAbi = [
        "function verify(tuple(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) req, bytes signature) view returns (bool)"
    ];
    const forwarderVerify = new ethers.Contract(this.VERIFYING_CONTRACT, forwarderVerifyAbi, this.provider);

    const isValid = await forwarderVerify.verify(request, signature);
    if (!isValid) {
        throw new Error('EIP-712 signature verification failed.');
    }

    this.logger.log(`Relaying transaction from ${request.from} to ${request.to}`);

    // 3. Send the transaction
    // The transaction will call the `execute` function on the verifying contract (Forwarder)
    // which will then execute the actual call (request.data) on behalf of the user (request.from).
    const forwarderAbi = [
        "function execute(tuple(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) req, bytes signature) returns (bool, bytes)",
        "function verify(tuple(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) req, bytes signature) view returns (bool)"
    ];
    const forwarder = new ethers.Contract(this.VERIFYING_CONTRACT, forwarderAbi, this.wallet);

    // Estimate gas for the transaction
    const gasLimit = await forwarder.execute.estimateGas(request, signature);

    const tx = await forwarder.execute(request, signature, {
        gasLimit: gasLimit,
    });

    await tx.wait();
    this.logger.log(`Transaction relayed: ${tx.hash}`);

    return tx.hash;
  }
}
