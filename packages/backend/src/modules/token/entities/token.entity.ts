import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("tokens")
export class TokenEntity {
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

  @Column({ type: "varchar", default: "bonding_curve" })
  status: "bonding_curve" | "migrated" | "delisted";

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  marketCap: number;

  @Column({ type: "decimal", precision: 20, scale: 8, default: 0 })
  currentPrice: number;

  @Column({ type: "int", default: 0 })
  bondingCurveProgress: number; // 0-100

  @Column({ nullable: true })
  ammAddress: string; // Address of AMM pool after migration

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
