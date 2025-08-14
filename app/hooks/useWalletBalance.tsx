"use client";

import { useState, useEffect } from "react";
import { useSmartAccountClient } from "@account-kit/react";
import { getAlchemyClient } from "@/lib/alchemy";

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
}

interface WalletBalances {
  ETH: TokenBalance;
  USDC?: TokenBalance;
  [key: string]: TokenBalance | undefined;
}

export function useWalletBalance() {
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { client } = useSmartAccountClient({});
  const walletAddress = client?.account?.address;

  useEffect(() => {
    async function fetchBalances() {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the singleton Alchemy client
        const alchemy = getAlchemyClient();

        // Get ETH balance
        const ethBalance = await alchemy.core.getBalance(walletAddress);
        const ethBalanceFormatted = (
          parseFloat(ethBalance.toString()) / 1e18
        ).toFixed(6);

        // Get token balances (ERC-20 tokens)
        const tokenBalances = await alchemy.core.getTokenBalances(
          walletAddress
        );

        const balanceData: WalletBalances = {
          ETH: {
            symbol: "ETH",
            name: "Ethereum",
            balance: ethBalanceFormatted,
            decimals: 18,
          },
        };

        // Process token balances
        for (const token of tokenBalances.tokenBalances) {
          if (token.tokenBalance && token.tokenBalance !== "0x0") {
            try {
              // Get token metadata
              const metadata = await alchemy.core.getTokenMetadata(
                token.contractAddress
              );

              if (metadata.symbol && metadata.decimals) {
                const balance = parseInt(token.tokenBalance, 16);
                const formattedBalance = (
                  balance / Math.pow(10, metadata.decimals)
                ).toFixed(metadata.decimals <= 6 ? metadata.decimals : 6);

                balanceData[metadata.symbol] = {
                  symbol: metadata.symbol,
                  name: metadata.name || metadata.symbol,
                  balance: formattedBalance,
                  decimals: metadata.decimals,
                  contractAddress: token.contractAddress,
                };
              }
            } catch (tokenError) {
              // Silently skip tokens with metadata issues
              // In production, consider logging to error tracking service
            }
          }
        }

        setBalances(balanceData);
      } catch (err) {
        // Handle error appropriately - in production, use proper error reporting service
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError("Failed to fetch wallet balances");
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, [walletAddress]);

  return {
    balances,
    loading,
    error,
    refetch: () => {
      if (walletAddress) {
        setLoading(true);
        // Re-trigger the effect by updating a dependency
      }
    },
  };
}
