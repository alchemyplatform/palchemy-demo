// Turnkey configuration and utilities

import {
  DEFAULT_ETHEREUM_ACCOUNTS,
  Turnkey,
  TurnkeyServerClient,
} from "@turnkey/sdk-server";
import { generateP256KeyPair } from "@turnkey/crypto";
import { createAccount } from "@turnkey/viem";

import {
  CreateEscrowRequest,
  CreateEscrowResponse,
  TransferAndCleanupRequest,
} from "./types/turnkey";
import {
  Account,
  Chain,
  createPublicClient,
  createWalletClient,
  formatEther,
  getAddress,
  http,
} from "viem";
import { alchemyRpcUrl, DEFAULT_CHAIN } from "./constants";

export const turnkey = new Turnkey({
  apiBaseUrl: "https://api.turnkey.com",
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
  defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID!,
});

export async function createEscrowOrganization(request: CreateEscrowRequest) {
  // Generate a new API key pair for the claim key
  const claimKeyPair = generateP256KeyPair();
  const transactionId = crypto.randomUUID();

  const apiClient = turnkey.apiClient();

  try {
    // Create temporary sub-organization with both sender email and claim API key
    const response = await apiClient.createSubOrganization({
      subOrganizationName: `Escrow-${transactionId}`,
      rootUsers: [
        {
          userName: "Escrow User",
          userEmail: request.senderEmail,
          apiKeys: [
            {
              apiKeyName: "Claim Key",
              publicKey: claimKeyPair.publicKey,
              curveType: "API_KEY_CURVE_P256",
            },
          ],
          authenticators: [],
          oauthProviders: [],
        },
      ],
      rootQuorumThreshold: 1,
      wallet: {
        walletName: "Escrow Wallet",
        accounts: DEFAULT_ETHEREUM_ACCOUNTS,
      },
    });

    if (!response.activity.result?.createSubOrganizationResultV7) {
      throw new Error("Failed to create sub-organization");
    }

    const result = response.activity.result.createSubOrganizationResultV7;
    const escrowSubOrgId = result.subOrganizationId!;

    const walletAddress = result.wallet?.addresses[0];
    if (!walletAddress) {
      throw new Error("Failed to get escrow wallet ID");
    }

    const createEscrowResponse: CreateEscrowResponse = {
      organizationId: escrowSubOrgId,
      organizationName: request.organizationName,
      claimKeyPair,
      walletAddress,
      senderEmail: request.senderEmail,
      status: "created",
    };

    return createEscrowResponse;
  } catch (error) {
    // Re-throw error for proper handling by calling function
    throw error;
  }
}

export async function transferFunds(params: TransferAndCleanupRequest) {
  const escrowClient = new Turnkey({
    apiBaseUrl: "https://api.turnkey.com",
    apiPrivateKey: params.privateKey,
    apiPublicKey: params.publicKey,
    defaultOrganizationId: params.organizationId,
  });

  const walletClient = await getTurnkeyWalletClient(
    escrowClient.apiClient(),
    params.escrowWalletAddress,
    DEFAULT_CHAIN,
    alchemyRpcUrl,
    params.organizationId
  );

  const amountToSend = await calculateTransferAmount(
    params.escrowWalletAddress,
    getAddress(params.destinationWalletAddress)
  );

  const transaction = await walletClient.prepareTransactionRequest({
    to: getAddress(params.destinationWalletAddress!),
    value: amountToSend,
    chainId: DEFAULT_CHAIN.id,
  });

  const txHash = await walletClient.sendTransaction(transaction);

  const deleteResponse = await escrowClient.apiClient().deleteSubOrganization({
    organizationId: params.organizationId,
    deleteWithoutExport: true,
  });

  // Organization deleted successfully

  return {
    hash: txHash,
    amount: params.amount,
    recipientAddress: params.recipientAddress,
  };
}

// Add any other utility functions you need
async function calculateTransferAmount(fromAddress: string, toAddress: string) {
  const publicClient = createPublicClient({
    chain: DEFAULT_CHAIN,
    transport: http(alchemyRpcUrl),
  });

  // 1. Get balance
  const balance = await publicClient.getBalance({
    address: fromAddress as `0x${string}`,
  });

  // 2. Estimate gas
  const estimatedGas = await publicClient.estimateGas({
    account: fromAddress as `0x${string}`,
    to: toAddress as `0x${string}`,
    value: BigInt(0),
  });

  const { maxFeePerGas, maxPriorityFeePerGas } =
    await publicClient.estimateFeesPerGas();

  const gasFee = estimatedGas * maxFeePerGas;

  // 4. Calculate transferable amount
  const valueToSend = balance - gasFee;

  return valueToSend;
}

/**
 * Creates and returns a wallet client for interacting with the Turnkey API using a specified account.
 *
 * @param {TurnkeyBrowserClient} turnkeyClient - The Turnkey client instance used for the API connection.
 * @param {string} signWith - The Turnkey wallet account address or private key ID used to sign transactions
 * @returns {Promise<WalletClient>} A promise that resolves to the wallet client configured for the specified account and chain.
 */
export const getTurnkeyWalletClient = async (
  turnkeyClient: TurnkeyServerClient,
  signWith: string,
  chain: Chain,
  rpcUrl: string,
  organizationId: string
) => {
  // Create a new account using the provided Turnkey client and the specified account for signing
  const turnkeyAccount = await createAccount({
    client: turnkeyClient as any, // Type assertion for Turnkey SDK compatibility
    organizationId: organizationId,
    signWith,
  });

  // Create a wallet client using the newly created account, targeting the Sepolia chain
  const client = createWalletClient({
    account: turnkeyAccount as Account,
    chain: chain,
    transport: http(rpcUrl),
  });

  return client;
};
