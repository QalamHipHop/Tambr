import { Controller, Post, Get, Param, Body } from "@nestjs/common";
import { WalletService } from "../services/wallet.service";
import { CreateWalletDto } from "../dto/create-wallet.dto";

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * POST /wallet/create
   * Create a new wallet with Social Recovery setup
   */
  @Post("create")
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.createWallet(createWalletDto);
  }

  /**
   * GET /wallet/:walletAddress
   * Get wallet information
   */
  @Get(":walletAddress")
  async getWallet(@Param("walletAddress") walletAddress: string) {
    return this.walletService.getWallet(walletAddress);
  }

  /**
   * POST /wallet/:walletAddress/guardian
   * Add a guardian
   */
  @Post(":walletAddress/guardian")
  async addGuardian(
    @Param("walletAddress") walletAddress: string,
    @Body() body: { guardianAddress: string }
  ) {
    return this.walletService.addGuardian(walletAddress, body.guardianAddress);
  }

  /**
   * GET /wallet/:walletAddress/guardians
   * Get all guardians
   */
  @Get(":walletAddress/guardians")
  async getGuardians(@Param("walletAddress") walletAddress: string) {
    return this.walletService.getGuardians(walletAddress);
  }

  /**
   * POST /wallet/:walletAddress/recovery/initiate
   * Initiate wallet recovery
   */
  @Post(":walletAddress/recovery/initiate")
  async initiateRecovery(
    @Param("walletAddress") walletAddress: string,
    @Body() body: { newOwnerAddress: string }
  ) {
    return this.walletService.initiateRecovery(walletAddress, body.newOwnerAddress);
  }

  /**
   * POST /wallet/:walletAddress/recovery/complete
   * Complete wallet recovery
   */
  @Post(":walletAddress/recovery/complete")
  async completeRecovery(
    @Param("walletAddress") walletAddress: string,
    @Body() body: { recoveryHash: string; guardianSignatures: string[] }
  ) {
    return this.walletService.completeRecovery(
      walletAddress,
      body.recoveryHash,
      body.guardianSignatures
    );
  }
}
