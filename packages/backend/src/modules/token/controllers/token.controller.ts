import { Controller, Post, Get, Param, Body, Query } from "@nestjs/common";
import { TokenService } from "../services/token.service";
import { CreateTokenDto } from "../dto/create-token.dto";

@Controller("tokens")
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * POST /tokens/register
   * Register a new token
   */
  @Post("register")
  async registerToken(@Body() createTokenDto: CreateTokenDto) {
    return this.tokenService.registerToken(createTokenDto);
  }

  /**
   * GET /tokens/:contractAddress
   * Get token information
   */
  @Get(":contractAddress")
  async getToken(@Param("contractAddress") contractAddress: string) {
    return this.tokenService.getToken(contractAddress);
  }

  /**
   * GET /tokens
   * Get all active bonding curve tokens
   */
  @Get()
  async getActiveBondingCurveTokens() {
    return this.tokenService.getActiveBondingCurveTokens();
  }

  /**
   * GET /tokens/migrated
   * Get all migrated tokens
   */
  @Get("migrated/list")
  async getMigratedTokens() {
    return this.tokenService.getMigratedTokens();
  }

  /**
   * GET /tokens/top
   * Get top tokens by market cap
   */
  @Get("top/list")
  async getTopTokens(@Query("limit") limit: number = 10) {
    return this.tokenService.getTopTokens(limit);
  }

  /**
   * GET /tokens/search
   * Search tokens by name or symbol
   */
  @Get("search/query")
  async searchTokens(@Query("q") query: string) {
    return this.tokenService.searchTokens(query);
  }
}
