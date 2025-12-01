import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TokenEntity } from "../entities/token.entity";
import { CreateTokenDto } from "../dto/create-token.dto";

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>
  ) {}

  /**
   * Register a new token
   */
  async registerToken(createTokenDto: CreateTokenDto): Promise<TokenEntity> {
    const token = this.tokenRepository.create(createTokenDto);
    return this.tokenRepository.save(token);
  }

  /**
   * Get token by contract address
   */
  async getToken(contractAddress: string): Promise<TokenEntity> {
    const token = await this.tokenRepository.findOne({
      where: { contractAddress },
    });

    if (!token) {
      throw new NotFoundException("Token not found");
    }

    return token;
  }

  /**
   * Get all tokens on bonding curve
   */
  async getActiveBondingCurveTokens(): Promise<TokenEntity[]> {
    return this.tokenRepository.find({
      where: { status: "bonding_curve" },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get all migrated tokens
   */
  async getMigratedTokens(): Promise<TokenEntity[]> {
    return this.tokenRepository.find({
      where: { status: "migrated" },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Update token price and market cap
   */
  async updateTokenPrice(
    contractAddress: string,
    price: number,
    marketCap: number
  ): Promise<TokenEntity> {
    const token = await this.getToken(contractAddress);
    token.currentPrice = price;
    token.marketCap = marketCap;
    return this.tokenRepository.save(token);
  }

  /**
   * Update bonding curve progress
   */
  async updateBondingCurveProgress(
    contractAddress: string,
    progress: number
  ): Promise<TokenEntity> {
    const token = await this.getToken(contractAddress);
    token.bondingCurveProgress = Math.min(100, Math.max(0, progress));
    return this.tokenRepository.save(token);
  }

  /**
   * Mark token as migrated to AMM
   */
  async migrateToAmm(
    contractAddress: string,
    ammAddress: string
  ): Promise<TokenEntity> {
    const token = await this.getToken(contractAddress);
    token.status = "migrated";
    token.ammAddress = ammAddress;
    return this.tokenRepository.save(token);
  }

  /**
   * Get top tokens by market cap
   */
  async getTopTokens(limit: number = 10): Promise<TokenEntity[]> {
    return this.tokenRepository.find({
      where: { status: "bonding_curve" },
      order: { marketCap: "DESC" },
      take: limit,
    });
  }

  /**
   * Search tokens by name or symbol
   */
  async searchTokens(query: string): Promise<TokenEntity[]> {
    return this.tokenRepository
      .createQueryBuilder("token")
      .where("token.name ILIKE :query", { query: `%${query}%` })
      .orWhere("token.symbol ILIKE :query", { query: `%${query}%` })
      .orderBy("token.marketCap", "DESC")
      .limit(20)
      .getMany();
  }
}
