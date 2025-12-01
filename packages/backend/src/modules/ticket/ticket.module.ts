import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TicketController } from "./controllers/ticket.controller";
import { TicketService } from "./services/ticket.service";
import { TicketEntity } from "./entities/ticket.entity";

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity])],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
