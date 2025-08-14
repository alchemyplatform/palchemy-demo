"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  ChevronDown,
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { formatAddress } from "@/lib/utils";

interface BalanceCardProps {
  client?: any;
  walletAddress?: string;
}

export default function BalanceCard({
  client,
  walletAddress,
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("ETH");
  const [isCopied, setIsCopied] = useState(false);
  const { balances, loading, error, refetch } = useWalletBalance();

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Wallet</CardTitle>
          <CardDescription>Loading wallet information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !balances) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Wallet</CardTitle>
          <CardDescription>Failed to load wallet information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 text-sm mb-4">
              {error || "Unable to fetch wallet data"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get available currencies from the balances
  const availableCurrencies = Object.keys(balances);

  // Set default currency if selected currency is not available
  const currentCurrency = balances[selectedCurrency]
    ? selectedCurrency
    : availableCurrencies[0];
  const currentBalance = balances[currentCurrency];

  if (!currentBalance) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Wallet</CardTitle>
          <CardDescription>No balances found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No cryptocurrency balances detected in this wallet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Your Wallet</CardTitle>
            <CardDescription>Balance and address information</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refetch}
              className="h-8 w-8"
              title="Refresh balances"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="h-8 w-8"
            >
              {showBalance ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Wallet Address Section */}
          {walletAddress && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Wallet Address
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-xs py-1 px-2"
                >
                  {formatAddress(walletAddress)}
                </Badge>
                <TooltipProvider>
                  <Tooltip open={isCopied}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopy}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copied!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    if (client?.chain?.blockExplorers?.default?.url) {
                      window.open(
                        `${client.chain.blockExplorers.default.url}/address/${walletAddress}`,
                        "_blank"
                      );
                    }
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Balance Section */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Available Balance
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {currentBalance.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      {showBalance ? currentBalance.balance : "••••••"}
                    </span>
                    <span className="text-gray-600">
                      {currentBalance.symbol}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{currentBalance.name}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <span>{currentCurrency}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>

            {availableCurrencies.length > 1 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex gap-2 flex-wrap">
                  {availableCurrencies.map((currency) => {
                    const balance = balances[currency];
                    if (!balance) return null;

                    return (
                      <Badge
                        key={currency}
                        variant={
                          currency === currentCurrency ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => setSelectedCurrency(currency)}
                      >
                        {currency}: {showBalance ? balance.balance : "••••"}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
