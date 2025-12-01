/**
 * Shared Types for Tambr Project
 */

// ============ Token Types ============

export interface Token {
  contractAddress: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  creatorAddress: string;
  status: "bonding_curve" | "migrated" | "delisted";
  marketCap: number;
  currentPrice: number;
  bondingCurveProgress: number;
  createdAt: Date;
}

export interface BondingCurveData {
  tokenAddress: string;
  virtualBaseReserve: bigint;
  virtualTokenReserve: bigint;
  realBaseReserve: bigint;
  realTokenReserve: bigint;
  currentPrice: number;
  progress: number;
}

// ============ Wallet Types ============

export interface Wallet {
  id: string;
  walletAddress: string;
  ownerName: string;
  status: "active" | "locked" | "recovered";
  guardians: string[];
  recoveryThreshold: number;
  createdAt: Date;
}

export interface GuardianSetup {
  walletAddress: string;
  guardians: string[];
  recoveryThreshold: number;
}

// ============ KYC Types ============

export interface KycStatus {
  walletAddress: string;
  status: "pending" | "approved" | "rejected";
  kycLevel: number;
  createdAt: Date;
}

export interface KycSubmission {
  walletAddress: string;
  phoneNumber: string;
  nationalId: string;
}

// ============ Transaction Types ============

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  tokenAddress: string;
  type: "buy" | "sell" | "transfer";
  status: "pending" | "completed" | "failed";
  txHash?: string;
  createdAt: Date;
}

export interface GaslessTransaction {
  from: string;
  to: string;
  data: string;
  signature: string;
  nonce: number;
}

// ============ Oracle Types ============

export interface PriceData {
  pair: string;
  price: number;
  timestamp: Date;
}

export interface MarketData {
  tokenAddress: string;
  price: number;
  marketCap: number;
  volume24h?: number;
  change24h?: number;
}

// ============ API Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
