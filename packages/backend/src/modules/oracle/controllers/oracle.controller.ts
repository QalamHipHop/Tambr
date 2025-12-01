import { Controller, Get, Post, Param } from "@nestjs/common";
import { OracleService } from "../services/oracle.service";

@Controller("oracle")
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  /**
   * GET /oracle/price/irr-usd
   * Get current IRR/USD exchange rate
   */
  @Get("price/irr-usd")
  async getIrrUsdPrice() {
    const price = await this.oracleService.getIrrUsdPrice();
    return {
      pair: "IRR/USD",
      price,
      timestamp: new Date(),
    };
  }

  /**
   * GET /oracle/price/:tokenAddress
   * Get token price in IRR
   */
  @Get("price/:tokenAddress")
  async getTokenPrice(@Param("tokenAddress") tokenAddress: string) {
    const price = await this.oracleService.getTokenPrice(tokenAddress);
    return {
      tokenAddress,
      price,
      currency: "IRR",
      timestamp: new Date(),
    };
  }

  /**
   * GET /oracle/market-cap/:tokenAddress
   * Get market cap for a token
   */
  @Get("market-cap/:tokenAddress")
  async getMarketCap(@Param("tokenAddress") tokenAddress: string) {
    const marketCap = await this.oracleService.getTokenMarketCap(tokenAddress);
    return {
      tokenAddress,
      marketCap,
      currency: "IRR",
      timestamp: new Date(),
    };
  }

  /**
   * POST /oracle/update-dynamic-factor/:dbcAddress
   * Calculates and updates the dynamic factor for the DBC contract
   */
  @Post("update-dynamic-factor/:dbcAddress")
  async updateDynamicFactor(@Param("dbcAddress") dbcAddress: string) {
    // 1. Calculate the new dynamic factor
    const newFactor = await this.oracleService.calculateDynamicFactor();

    // 2. Send the update transaction to the DBC contract (mocked)
    const result = await this.oracleService.updateDynamicFactor(
      dbcAddress,
      newFactor
    );

    return {
      message: "Dynamic factor update triggered successfully.",
      dbcAddress,
      newFactor,
      result,
      timestamp: new Date(),
    };
  }

  /**
   * GET /oracle/bonding-curve/:tokenAddress
   * Get bonding curve progress
   */
  @Get("bonding-curve/:tokenAddress")
  async getBondingCurveProgress(@Param("tokenAddress") tokenAddress: string) {
    const progress = await this.oracleService.getBondingCurveProgress(tokenAddress);
    return {
      tokenAddress,
      progress,
      percentage: `${progress}%`,
      timestamp: new Date(),
    };
  }
}
