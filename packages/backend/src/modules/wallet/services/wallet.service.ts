import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WalletEntity } from "../entities/wallet.entity";
import { CreateWalletDto } from "../dto/create-wallet.dto";

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>
  ) {}

  /**
   * Create a new wallet with Social Recovery setup
   */
  async createWallet(createWalletDto: CreateWalletDto): Promise<WalletEntity> {
    const { walletAddress, ownerName, guardians, recoveryThreshold } = createWalletDto;

    // Check if wallet already exists
    const existingWallet = await this.walletRepository.findOne({
      where: { walletAddress },
    });

    if (existingWallet) {
      throw new BadRequestException("Wallet already exists");
    }

    // Validate guardians
    if (guardians && guardians.length > 0) {
      if (recoveryThreshold > guardians.length) {
        throw new BadRequestException(
          "Recovery threshold cannot exceed number of guardians"
        );
      }
    }

    const wallet = this.walletRepository.create({
      walletAddress,
      ownerName,
      guardians: guardians || [],
      recoveryThreshold: recoveryThreshold || 0,
      status: "active",
    });

    return this.walletRepository.save(wallet);
  }

  /**
   * Get wallet information
   */
  async getWallet(walletAddress: string): Promise<WalletEntity> {
    const wallet = await this.walletRepository.findOne({
      where: { walletAddress },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    return wallet;
  }

  /**
   * Add a guardian to the wallet
   */
  async addGuardian(
    walletAddress: string,
    guardianAddress: string
  ): Promise<WalletEntity> {
    const wallet = await this.getWallet(walletAddress);

    if (wallet.guardians.includes(guardianAddress)) {
      throw new BadRequestException("Guardian already exists");
    }

    wallet.guardians.push(guardianAddress);
    return this.walletRepository.save(wallet);
  }

  /**
   * Remove a guardian from the wallet
   */
  async removeGuardian(
    walletAddress: string,
    guardianAddress: string
  ): Promise<WalletEntity> {
    const wallet = await this.getWallet(walletAddress);

    wallet.guardians = wallet.guardians.filter((g) => g !== guardianAddress);
    return this.walletRepository.save(wallet);
  }

  /**
   * Initiate wallet recovery
   */
  async initiateRecovery(
    walletAddress: string,
    newOwnerAddress: string
  ): Promise<{ recoveryHash: string }> {
    const wallet = await this.getWallet(walletAddress);

    if (wallet.guardians.length === 0) {
      throw new BadRequestException("No guardians set for this wallet");
    }

    // Generate recovery hash
    const crypto = require("crypto");
    const recoveryHash = crypto
      .createHash("sha256")
      .update(`${walletAddress}:${newOwnerAddress}:${Date.now()}`)
      .digest("hex");

    wallet.recoveryHash = recoveryHash;
    wallet.status = "locked"; // Lock wallet during recovery
    await this.walletRepository.save(wallet);

    return { recoveryHash };
  }

  /**
   * Complete wallet recovery
   */
  async completeRecovery(
    walletAddress: string,
    recoveryHash: string,
    guardianSignatures: string[]
  ): Promise<WalletEntity> {
    const wallet = await this.getWallet(walletAddress);

    if (wallet.recoveryHash !== recoveryHash) {
      throw new BadRequestException("Invalid recovery hash");
    }

    if (guardianSignatures.length < wallet.recoveryThreshold) {
      throw new BadRequestException(
        "Insufficient guardian signatures for recovery"
      );
    }

    wallet.status = "recovered";
    wallet.recoveryHash = null;
    return this.walletRepository.save(wallet);
  }

  /**
   * Get all guardians for a wallet
   */
  async getGuardians(walletAddress: string): Promise<string[]> {
    const wallet = await this.getWallet(walletAddress);
    return wallet.guardians;
  }
}
