import { Controller, Post, Get, Param, Body, Query } from "@nestjs/common";
import { TicketService } from "../services/ticket.service";
import { CreateTicketDto } from "../dto/create-ticket.dto";

@Controller("tickets")
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  /**
	   * POST /tickets/register
	   * Register a new event/ticket batch
	   */
	  @Post("register")
	  async registerTicketBatch(@Body() createTicketDto: CreateTicketDto) {
	    return this.ticketService.registerTicketBatch(createTicketDto);
	  }

  /**
	   * GET /tickets/:contractAddress
	   * Get ticket batch information
	   */
	  @Get(":contractAddress")
	  async getTicketBatch(@Param("contractAddress") contractAddress: string) {
	    return this.ticketService.getTicketBatch(contractAddress);
	  }

  /**
	   * GET /tickets
	   * Get all active ticket batches
	   */
	  @Get()
	  async getActiveTicketBatches() {
	    return this.ticketService.getActiveTicketBatches();
	  }

  /**
	   * GET /tickets/creator/:creatorAddress
	   * Get all ticket batches by creator
	   */
	  @Get("creator/:creatorAddress")
	  async getTicketBatchesByCreator(@Param("creatorAddress") creatorAddress: string) {
	    return this.ticketService.getTicketBatchesByCreator(creatorAddress);
	  }

  /**
	   * GET /tickets/top
	   * Get top ticket batches by secondary market volume
	   */
	  @Get("top/list")
	  async getTopTicketBatches(@Query("limit") limit: number = 10) {
	    return this.ticketService.getTopTicketBatches(limit);
	  }

  /**
	   * GET /tickets/search
	   * Search ticket batches by name, symbol, or event title
	   */
	  @Get("search/query")
	  async searchTicketBatches(@Query("q") query: string) {
	    return this.ticketService.searchTicketBatches(query);
	  }
}
