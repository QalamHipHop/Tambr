import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KycEntity } from "../entities/kyc.entity";
import { CreateKycDto } from "../dto/create-kyc.dto";

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycEntity)
    private kycRepository: Repository<KycEntity>
  ) {}

  /**
   * Submit KYC Level 1 verification
   */
  async submitKycLevel1(createKycDto: CreateKycDto): Promise<KycEntity> {
    const { walletAddress, phoneNumber, nationalId } = createKycDto;

    // Check if KYC already exists for this wallet
    const existingKyc = await this.kycRepository.findOne({
      where: { walletAddress },
    });

    if (existingKyc && existingKyc.status === "approved") {
      throw new BadRequestException("KYC already approved for this wallet");
    }

    // Validate phone number format (Iranian format)
    if (!this.isValidIranianPhone(phoneNumber)) {
      throw new BadRequestException("Invalid Iranian phone number");
    }

    // Validate national ID format (Iranian format)
    if (!this.isValidIranianNationalId(nationalId)) {
      throw new BadRequestException("Invalid Iranian national ID");
    }

    // Create or update KYC record
    let kyc = existingKyc || this.kycRepository.create();
    kyc.walletAddress = walletAddress;
    kyc.phoneNumber = phoneNumber;
    kyc.nationalId = nationalId;
    kyc.status = "approved"; // Auto-approve for now (in production, integrate with national registry)
    kyc.kycLevel = 1;
    kyc.verificationHash = this.generateVerificationHash(phoneNumber, nationalId);

    return this.kycRepository.save(kyc);
  }

  /**
   * Get KYC status for a wallet
   */
  async getKycStatus(walletAddress: string): Promise<KycEntity | null> {
    return this.kycRepository.findOne({
      where: { walletAddress },
    });
  }

  /**
   * Check if wallet has passed KYC
   */
  async isKycApproved(walletAddress: string): Promise<boolean> {
    const kyc = await this.getKycStatus(walletAddress);
    return kyc?.status === "approved";
  }

  /**
   * Validate Iranian phone number
   */
  private isValidIranianPhone(phone: string): boolean {
    const iranianPhoneRegex = /^(\+98|0)?9\d{9}$/;
    return iranianPhoneRegex.test(phone.replace(/\s/g, ""));
  }

  /**
   * Validate Iranian national ID
   */
  private isValidIranianNationalId(nationalId: string): boolean {
    const cleanId = nationalId.replace(/\D/g, "");
    if (cleanId.length !== 10) return false;

    // Luhn algorithm for validation
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanId[i]) * (10 - i);
    }
    const remainder = sum % 11;
    const checkDigit = parseInt(cleanId[9]);

    return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
  }

  /**
   * Generate verification hash
   */
  private generateVerificationHash(phoneNumber: string, nationalId: string): string {
    const crypto = require("crypto");
    const data = `${phoneNumber}:${nationalId}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}
