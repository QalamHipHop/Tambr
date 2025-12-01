import { Controller, Post, Get, Body, Param } from "@nestjs/common";
import { KycService } from "../services/kyc.service";
import { CreateKycDto } from "../dto/create-kyc.dto";

@Controller("kyc")
export class KycController {
  constructor(private readonly kycService: KycService) {}

  /**
   * POST /kyc/submit
   * Submit KYC Level 1 verification
   */
  @Post("submit")
  async submitKyc(@Body() createKycDto: CreateKycDto) {
    return this.kycService.submitKycLevel1(createKycDto);
  }

  /**
   * GET /kyc/status/:walletAddress
   * Get KYC status for a wallet
   */
  @Get("status/:walletAddress")
  async getStatus(@Param("walletAddress") walletAddress: string) {
    const status = await this.kycService.getKycStatus(walletAddress);
    return {
      walletAddress,
      status: status?.status || "not_found",
      kycLevel: status?.kycLevel || 0,
    };
  }

  /**
   * GET /kyc/check/:walletAddress
   * Check if wallet has passed KYC
   */
  @Get("check/:walletAddress")
  async checkKyc(@Param("walletAddress") walletAddress: string) {
    const isApproved = await this.kycService.isKycApproved(walletAddress);
    return {
      walletAddress,
      isApproved,
    };
  }
}
