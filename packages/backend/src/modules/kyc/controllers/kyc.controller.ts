import { Controller, Post, Get, Body, Param } from "@nestjs/common";
import { KycService } from "../services/kyc.service";
import { CreateKycDto } from "../dto/create-kyc.dto";
import { SubmitKycLevel2Dto } from "../dto/submit-kyc-level2.dto";

@Controller("kyc")
export class KycController {
  constructor(private readonly kycService: KycService) {}

  /**
   * POST /kyc/submit
   * Submit KYC Level 1 verification
   */
  @Post("submit")
  async submitKycLevel1(@Body() createKycDto: CreateKycDto) {
    return this.kycService.submitKycLevel1(createKycDto);
  }

  /**
   * POST /kyc/submit-level2
   * Submit KYC Level 2 verification
   */
  @Post("submit-level2")
  async submitKycLevel2(@Body() submitKycLevel2Dto: SubmitKycLevel2Dto) {
    return this.kycService.submitKycLevel2(submitKycLevel2Dto);
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
