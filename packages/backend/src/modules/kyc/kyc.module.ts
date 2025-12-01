import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KycController } from "./controllers/kyc.controller";
import { KycService } from "./services/kyc.service";
import { KycEntity } from "./entities/kyc.entity";

@Module({
  imports: [TypeOrmModule.forFeature([KycEntity])],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
