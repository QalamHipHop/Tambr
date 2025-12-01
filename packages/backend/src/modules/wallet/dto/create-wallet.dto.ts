import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional } from "class-validator";

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsArray()
  @IsOptional()
  guardians?: string[];

  @IsNumber()
  @IsOptional()
  recoveryThreshold?: number;
}
