import { IsString, IsNotEmpty, IsOptional, IsUrl } from "class-validator";

export class SubmitKycLevel2Dto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  idCardImage: string; // URL to the uploaded ID card image

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  selfieVideo: string; // URL to the uploaded selfie video

  @IsString()
  @IsOptional()
  notes?: string;
}
