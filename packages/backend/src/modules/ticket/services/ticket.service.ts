import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TicketEntity } from "../entities/ticket.entity";
import { CreateTicketDto } from "../dto/create-ticket.dto";

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketEntity)
    private ticketRepository: Repository<TicketEntity>
  ) {}

  /**
   * Register a new event/ticket batch
   */
  async registerTicketBatch(createTicketDto: CreateTicketDto): Promise<TicketEntity> {
    const ticketBatch = this.ticketRepository.create(createTicketDto);
    return this.ticketRepository.save(ticketBatch);
  }

  /**
   * Get ticket batch by contract address
   */
  async getTicketBatch(contractAddress: string): Promise<TicketEntity> {
    const ticketBatch = await this.ticketRepository.findOne({
      where: { contractAddress },
    });

    if (!ticketBatch) {
      throw new NotFoundException("Ticket batch not found");
    }

    return ticketBatch;
  }

  /**
   * Get all active ticket batches
   */
  async getActiveTicketBatches(): Promise<TicketEntity[]> {
    return this.ticketRepository.find({
      where: { status: "active" },
      order: { eventDate: "ASC" },
    });
  }

  /**
   * Get all ticket batches by creator
   */
  async getTicketBatchesByCreator(creatorAddress: string): Promise<TicketEntity[]> {
    return this.ticketRepository.find({
      where: { creatorAddress },
      order: { eventDate: "DESC" },
    });
  }

  /**
   * Update ticket batch sales and secondary market volume
   */
  async updateTicketSales(
    contractAddress: string,
    ticketsSold: number,
    secondaryMarketVolume: number
  ): Promise<TicketEntity> {
    const ticketBatch = await this.getTicketBatch(contractAddress);
    ticketBatch.ticketsSold = ticketsSold;
    ticketBatch.secondaryMarketVolume = secondaryMarketVolume;
    return this.ticketRepository.save(ticketBatch);
  }

  /**
   * Update ticket batch status
   */
  async updateTicketStatus(
    contractAddress: string,
    status: "active" | "sold_out" | "expired" | "canceled"
  ): Promise<TicketEntity> {
    const ticketBatch = await this.getTicketBatch(contractAddress);
    ticketBatch.status = status;
    return this.ticketRepository.save(ticketBatch);
  }

  // Removed: migrateToAmm (DBC specific)

  /**
   * Get top ticket batches by secondary market volume
   */
  async getTopTicketBatches(limit: number = 10): Promise<TicketEntity[]> {
    return this.ticketRepository.find({
      where: { status: "active" },
      order: { secondaryMarketVolume: "DESC" },
      take: limit,
    });
  }

  /**
   * Search ticket batches by name, symbol, or event title
   */
  async searchTicketBatches(query: string): Promise<TicketEntity[]> {
    return this.ticketRepository
      .createQueryBuilder("ticket")
      .where("ticket.name ILIKE :query", { query: `%${query}%` })
      .orWhere("ticket.symbol ILIKE :query", { query: `%${query}%` })
      .orWhere("ticket.eventTitle ILIKE :query", { query: `%${query}%` })
      .orderBy("ticket.eventDate", "ASC")
      .limit(20)
      .getMany();
  }
}
