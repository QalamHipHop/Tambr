import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import SmartTicketArtifact from '../../contracts/artifacts/src/contracts/SmartTicket.sol/SmartTicket.json';

dotenv.config();

// Define the structure for the new mint request
export interface MintRequest {
  to: string;
  quantity: number;
  eventId: number;
  ticketType: string;
}

@Injectable()
export class RelayerMintService {
  private readonly logger = new Logger(RelayerMintService.name);
  private wallet!: ethers.Wallet;
  private provider!: ethers.JsonRpcProvider;
  private smartTicketContract!: ethers.Contract;
  private readonly SMART_TICKET_ADDRESS: string;

  constructor() {
    this.SMART_TICKET_ADDRESS = process.env.SMART_TICKET_ADDRESS || '0x...';
    
    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;

    if (!privateKey || !rpcUrl) {
      this.logger.error('RELAYER_PRIVATE_KEY or RPC_URL not set in environment variables.');
    } else {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.smartTicketContract = new ethers.Contract(
        this.SMART_TICKET_ADDRESS,
        SmartTicketArtifact.abi,
        this.wallet // Connect with the relayer's wallet for signing
      );
      this.logger.log(`RelayerMintService initialized. SmartTicket Address: ${this.SMART_TICKET_ADDRESS}`);
    }
  }

  /**
   * Executes the minting transaction directly from the relayer's MINTER_ROLE account.
   * This bypasses the EIP-712 forwarder for simplicity in this specific minting logic,
   * assuming the relayer itself holds the MINTER_ROLE.
   * @param request The mint request details.
   * @returns The transaction hash.
   */
  async mintTickets(request: MintRequest): Promise<string> {
    if (!this.wallet) {
      throw new Error('Relayer not properly initialized.');
    }

    this.logger.log(`Attempting to mint ${request.quantity} tickets for event ${request.eventId} to ${request.to}`);

    try {
      let tx: ethers.TransactionResponse;
      
      if (request.quantity === 1) {
        tx = await this.smartTicketContract.mint(
          request.to,
          request.eventId,
          request.ticketType
        );
      } else {
        tx = await this.smartTicketContract.mintBatch(
          request.to,
          request.quantity,
          request.eventId,
          request.ticketType
        );
      }

      await tx.wait();
      this.logger.log(`Mint transaction successful: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      this.logger.error('Minting failed:', error);
      throw new Error(`Minting failed: ${error.message}`);
    }
  }
}
