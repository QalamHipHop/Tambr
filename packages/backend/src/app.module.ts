import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { KycModule } from "./modules/kyc/kyc.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { OracleModule } from "./modules/oracle/oracle.module";
import { TokenModule } from "./modules/token/token.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "tambr",
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== "production",
    }),
    ScheduleModule.forRoot(),
    KycModule,
    WalletModule,
    OracleModule,
    TokenModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
