"use client";

import { useState, useEffect } from "react";
import { getAlchemyClient } from "@/lib/alchemy";

interface EscrowBalance {
  amount: string;
  currency: string;
  escrowAddress: string;
}

export function useEscrowBalance(walletAddress: string) {
  const [balance, setBalance] = useState<EscrowBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEscrowBalance() {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // In a real app, you would:
        // 1. Call your backend API with the token to get the escrow wallet address
        // 2. Use that address to fetch the actual balance

        // Fetch real balance from the escrow address
        const alchemy = getAlchemyClient();
        const ethBalance = await alchemy.core.getBalance(walletAddress);
        const ethBalanceFormatted = (
          parseFloat(ethBalance.toString()) / 1e18
        ).toFixed(6);

        setBalance({
          amount: ethBalanceFormatted,
          currency: "ETH",
          escrowAddress: walletAddress,
        });
      } catch (err) {
        // Handle error appropriately - in production, use proper error reporting service
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError("Failed to fetch escrow balance");
      } finally {
        setLoading(false);
      }
    }

    fetchEscrowBalance();
  }, [walletAddress]);

  return { balance, loading, error };
}
