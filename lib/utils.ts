import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * ⚠️ SECURITY WARNING: This interface contains SENSITIVE DATA
 * Including private keys that should NEVER be transmitted in URLs in production
 */
export interface ClaimLinkData {
  transactionId: string;
  escrowSubOrgId: string;
  claimKeyPair: { privateKey: string; publicKey: string }; // 🚨 SENSITIVE: Private key data
  walletAddress: string;
  senderEmail: string;
  message?: string;
}

/**
 * ⚠️ CRITICAL SECURITY WARNING - FOR DEMO PURPOSES ONLY ⚠️
 *
 * This function generates claim links that contain SENSITIVE UNENCRYPTED DATA including:
 * - Private keys for escrow wallets
 * - Wallet addresses
 * - Transaction details
 * - Organization IDs
 *
 * This implementation is INTENTIONALLY INSECURE to demonstrate the payment flow
 * transparently for educational purposes.
 *
 * 🚨 NEVER USE THIS PATTERN IN PRODUCTION 🚨
 *
 * For production applications, you MUST:
 * 1. Store sensitive data server-side in an encrypted database
 * 2. Generate secure, time-limited access tokens instead of embedding data
 * 3. Implement proper authentication and authorization
 * 4. Use HTTPS everywhere
 * 5. Implement access logging and monitoring
 * 6. Follow security best practices for financial applications
 *
 * See README.md Security section for detailed production requirements.
 */
export function generateClaimLink(
  claimLinkData: ClaimLinkData,
  baseUrl: string = "http://localhost:3000"
): string {
  // WARNING: Base64 encoding is NOT encryption - this data is easily readable
  const jsonData = Buffer.from(JSON.stringify(claimLinkData)).toString(
    "base64"
  );
  const claimUrl = `${baseUrl}/claim?token=${jsonData}`;

  return claimUrl;
}
