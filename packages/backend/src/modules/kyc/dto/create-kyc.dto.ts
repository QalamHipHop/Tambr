import { IsString, IsNotEmpty, Matches } from "class-validator";

export class CreateKycDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+98|0)?9\d{9}$/, {
    message: "Invalid Iranian phone number",
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  nationalId: string;
}
