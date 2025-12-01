import { IsString, IsNotEmpty, IsOptional, IsUrl } from "class-validator";

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  contractAddress: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  creatorAddress: string;
}
