import { Module } from "@nestjs/common";
import { OracleController } from "./controllers/oracle.controller";
import { OracleService } from "./services/oracle.service";

@Module({
  controllers: [OracleController],
  providers: [OracleService],
  exports: [OracleService],
})
export class OracleModule {}
