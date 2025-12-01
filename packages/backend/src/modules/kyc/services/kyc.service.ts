import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KycEntity } from "../entities/kyc.entity";
import { CreateKycDto } from "../dto/create-kyc.dto";
import { SubmitKycLevel2Dto } from "../dto/submit-kyc-level2.dto";

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycEntity)
    private kycRepository: Repository<KycEntity>
  ) {}

  /**
   * Submit KYC Level 1 verification
   * This is the basic level, typically auto-approved with basic checks.
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
    kyc.status = "pending"; // Status is pending until a real-time check (mocked as approved for now)
    kyc.kycLevel = 1;
    
    // In a real system, this would be an API call to a national registry
    // For now, we'll mock the approval process
    kyc.status = "approved";
    kyc.verificationHash = this.generateVerificationHash(phoneNumber, nationalId);

    return this.kycRepository.save(kyc);
  }

  /**
   * Submit KYC Level 2 verification
   * This level requires manual/AI review of documents and video.
   */
  async submitKycLevel2(submitKycLevel2Dto: SubmitKycLevel2Dto): Promise<KycEntity> {
    const { walletAddress, idCardImage, selfieVideo } = submitKycLevel2Dto;

    // 1. Check if KYC Level 1 is approved
    const existingKyc = await this.kycRepository.findOne({
      where: { walletAddress },
    });

    if (!existingKyc || existingKyc.status !== "approved" || existingKyc.kycLevel < 1) {
      throw new BadRequestException("KYC Level 1 must be approved before submitting Level 2");
    }

    // 2. Check if Level 2 is already submitted/approved
    if (existingKyc.kycLevel === 2 && existingKyc.status === "approved") {
      throw new BadRequestException("KYC Level 2 already approved");
    }

    // 3. Update KYC record for Level 2 submission
    existingKyc.kycLevel = 2;
    existingKyc.status = "pending_review"; // Requires manual/AI review
    existingKyc.idCardImage = idCardImage;
    existingKyc.selfieVideo = selfieVideo;
    existingKyc.verificationHash = this.generateVerificationHash(
      existingKyc.phoneNumber,
      existingKyc.nationalId,
      idCardImage,
      selfieVideo
    );

    return this.kycRepository.save(existingKyc);
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
  private generateVerificationHash(
    phoneNumber: string,
    nationalId: string,
    idCardImage?: string,
    selfieVideo?: string
  ): string {
    const crypto = require("crypto");
    let data = `${phoneNumber}:${nationalId}`;
    if (idCardImage) data += `:${idCardImage}`;
    if (selfieVideo) data += `:${selfieVideo}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}
