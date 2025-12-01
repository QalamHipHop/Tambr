/**
 * Shared Utility Functions for Tambr Project
 */

import { ethers } from "ethers";

// ============ Address Utilities ============

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Convert address to checksum format
 */
export function toChecksumAddress(address: string): string {
  return ethers.getAddress(address);
}

// ============ Number Utilities ============

/**
 * Format a number with decimals
 */
export function formatNumber(
  value: string | number | bigint,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const formatted = ethers.formatUnits(value.toString(), decimals);
  return parseFloat(formatted).toFixed(displayDecimals);
}

/**
 * Parse a number to big integer with decimals
 */
export function parseNumber(value: string | number, decimals: number = 18): bigint {
  return ethers.parseUnits(value.toString(), decimals);
}

/**
 * Format currency with symbol
 */
export function formatCurrency(value: number, currency: string = "IRR"): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

// ============ Percentage Utilities ============

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// ============ Time Utilities ============

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number | Date): string {
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : timestamp;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get time difference in human readable format
 */
export function getTimeDifference(timestamp: number | Date): string {
  const now = new Date();
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : timestamp;
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date);
}

// ============ String Utilities ============

/**
 * Truncate address to short format
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

/**
 * Truncate string to specified length
 */
export function truncateString(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

// ============ Validation Utilities ============

/**
 * Validate Iranian phone number
 */
export function isValidIranianPhone(phone: string): boolean {
  const iranianPhoneRegex = /^(\+98|0)?9\d{9}$/;
  return iranianPhoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Validate Iranian national ID
 */
export function isValidIranianNationalId(nationalId: string): boolean {
  const cleanId = nationalId.replace(/\D/g, "");
  if (cleanId.length !== 10) return false;

  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanId[i]) * (10 - i);
  }
  const remainder = sum % 11;
  const checkDigit = parseInt(cleanId[9]);

  return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
}

// ============ Hash Utilities ============

/**
 * Generate SHA256 hash
 */
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============ Array Utilities ============

/**
 * Group array by property
 */
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============ Object Utilities ============

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects
 */
export function mergeObjects<T extends Record<string, any>>(
  ...objects: T[]
): T {
  return objects.reduce((result, obj) => ({ ...result, ...obj }), {} as T);
}
