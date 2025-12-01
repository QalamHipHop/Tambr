import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("wallets")
export class WalletEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  walletAddress: string;

  @Column()
  ownerName: string;

  @Column({ type: "varchar", default: "active" })
  status: "active" | "locked" | "recovered";

  @Column({ type: "simple-array", nullable: true })
  guardians: string[]; // Addresses of Social Recovery guardians

  @Column({ type: "int", default: 0 })
  recoveryThreshold: number; // Number of guardians needed for recovery

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  recoveryHash: string; // Hash for recovery process

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
