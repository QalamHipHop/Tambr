import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("tickets")
export class TicketEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  contractAddress: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  creatorAddress: string;

  @Column({ type: "varchar", default: "active" })
  status: "active" | "sold_out" | "expired" | "canceled";

  // Event Details
  @Column()
  eventTitle: string;

  @Column()
  eventVenue: string;

  @Column({ type: "timestamp" })
  eventDate: Date;

  @Column({ type: "int" })
  totalTickets: number;

  @Column({ type: "int" })
  ticketsSold: number;

  @Column({ type: "decimal", precision: 20, scale: 2 })
  initialPrice: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  secondaryMarketVolume: number;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
