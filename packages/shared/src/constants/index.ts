/**
 * Shared Constants for Tambr Project
 */

// ============ Contract Parameters ============

export const BONDING_CURVE_PARAMS = {
  FEE_PERCENTAGE: 800, // 0.8%
  FOUNDER_FEE_PERCENTAGE: 100, // 0.1% of fees
  BASIS_POINTS: 100000, // 100%
  INITIAL_VIRTUAL_BASE_RESERVE: "30000000000000000000", // 30 IRR
  INITIAL_VIRTUAL_TOKEN_RESERVE: "1073000000000000000000000000", // 1.073B tokens
  INITIAL_TOKEN_SUPPLY: "800000000000000000000000000", // 800M tokens
  TOTAL_TOKEN_SUPPLY: "1000000000000000000000000000", // 1B tokens
};

export const GOVERNANCE_TOKEN_PARAMS = {
  FOUNDER_ALLOCATION_PERCENTAGE: 10, // 10%
  TOTAL_SUPPLY: "1000000000000000000000000000", // 1B tokens
};

export const SMART_TICKET_PARAMS = {
  DEFAULT_ROYALTY_PERCENTAGE: 500, // 5%
};

// ============ Migration Parameters ============

export const MIGRATION_PARAMS = {
  MARKET_CAP_THRESHOLD: "69000000000000000000", // ~$69k in IRR
  LIQUIDITY_AMOUNT: "12000000000000000000", // 12 IRR
};

// ============ API Endpoints ============

export const API_ENDPOINTS = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
  RELAYER_URL: process.env.NEXT_PUBLIC_RELAYER_URL || "http://localhost:3002",
};

// ============ Network Configuration ============

export const NETWORK_CONFIG = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1337"),
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545",
  EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL || "http://localhost:8545",
};

// ============ Contract Addresses ============

export const CONTRACT_ADDRESSES = {
  IRR_STABLECOIN: process.env.NEXT_PUBLIC_IRR_STABLECOIN || "",
  GOVERNANCE_TOKEN: process.env.NEXT_PUBLIC_GOVERNANCE_TOKEN || "",
  SMART_TICKET: process.env.NEXT_PUBLIC_SMART_TICKET || "",
  SOULBOUND_TOKEN: process.env.NEXT_PUBLIC_SOULBOUND_TOKEN || "",
};

// ============ UI Constants ============

export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  CHART_UPDATE_INTERVAL: 5000, // 5 seconds
  PRICE_UPDATE_INTERVAL: 10000, // 10 seconds
  TOAST_DURATION: 3000, // 3 seconds
};

// ============ Validation Rules ============

export const VALIDATION_RULES = {
  MIN_TRANSACTION_AMOUNT: "1000000000000000", // 0.001 with 18 decimals
  MAX_TRANSACTION_AMOUNT: "1000000000000000000000000", // 1M with 18 decimals
  PHONE_NUMBER_REGEX: /^(\+98|0)?9\d{9}$/,
  NATIONAL_ID_LENGTH: 10,
};

// ============ Error Messages ============

export const ERROR_MESSAGES = {
  INVALID_ADDRESS: "Invalid wallet address",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  TRANSACTION_FAILED: "Transaction failed",
  NETWORK_ERROR: "Network error occurred",
  KYC_REQUIRED: "KYC verification required",
  INVALID_INPUT: "Invalid input provided",
};

// ============ Success Messages ============

export const SUCCESS_MESSAGES = {
  TRANSACTION_SUBMITTED: "Transaction submitted successfully",
  KYC_APPROVED: "KYC approved successfully",
  WALLET_CREATED: "Wallet created successfully",
  TOKEN_LAUNCHED: "Token launched successfully",
};
