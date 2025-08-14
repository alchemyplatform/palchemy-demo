// Turnkey TypeScript types

export interface CreateEscrowRequest {
  senderEmail: string;
  organizationName: string;
}

export interface CreateEscrowResponse {
  organizationId: string;
  organizationName: string;
  status: string;
  claimKeyPair: { privateKey: string; publicKey: string };
  walletAddress: string;
  senderEmail: string;
}

export interface TransferAndCleanupRequest {
  organizationId: string;
  recipientAddress: string;
  amount: string;
  privateKey: string;
  publicKey: string;
  escrowWalletAddress: string;
  destinationWalletAddress: string;
}

export interface TransferAndCleanupResponse {
  transferHash: string;
  organizationId: string;
  transferAmount: string;
  recipientAddress: string;
  organizationDeleted: boolean;
}

export interface TurnkeyError {
  message: string;
  code?: string;
  details?: any;
}
