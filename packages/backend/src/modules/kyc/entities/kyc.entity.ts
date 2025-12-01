import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("kyc")
export class KycEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  walletAddress: string;

  @Column()
  phoneNumber: string;

  @Column()
  nationalId: string;

  @Column({ type: "varchar", default: "pending" })
  status: "pending" | "approved" | "rejected"; // KYC status

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: "int", default: 1 })
  kycLevel: number; // KYC level (1, 2, 3, etc.)

  @Column({ nullable: true })
  verificationHash: string; // Hash of verification data

  @Column({ nullable: true })
  idCardImage: string; // URL to the uploaded ID card image for Level 2

  @Column({ nullable: true })
  selfieVideo: string; // URL to the uploaded selfie video for Level 2

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
