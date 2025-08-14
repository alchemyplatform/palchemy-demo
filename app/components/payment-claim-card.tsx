"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Loader2,
  ExternalLink,
  LogOut,
  ArrowRight,
} from "lucide-react";
import {
  useAuthModal,
  useSignerStatus,
  useSmartAccountClient,
  useLogout,
} from "@account-kit/react";
import { useEscrowBalance } from "../hooks/useEscrowBalance";
import { ClaimLinkData, formatAddress } from "@/lib/utils";

interface PaymentData {
  from: string;
  message: string;
  recipientEmail: string;
}

interface PaymentClaimCardProps {
  token: string;
}

export default function PaymentClaimCard({ token }: PaymentClaimCardProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [step, setStep] = useState<"claim" | "complete">("claim");

  const { openAuthModal } = useAuthModal();
  const { isConnected } = useSignerStatus();
  const { client, address, isLoadingClient } = useSmartAccountClient({});
  const { logout } = useLogout();

  const claimLinkData = useMemo(() => {
    // ⚠️ SECURITY WARNING: Decoding sensitive data from URL token
    // This exposes private keys and sensitive information in the browser
    // In production, use secure server-side session tokens instead
    const claimLinkData: ClaimLinkData = JSON.parse(
      Buffer.from(token, "base64").toString()
    );
    return claimLinkData;
  }, [token]);

  const {
    balance: escrowBalance,
    loading: balanceLoading,
    error: balanceError,
  } = useEscrowBalance(claimLinkData.walletAddress);

  // Simulate fetching payment metadata based on token
  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);

      // Mock data - in real app, this would come from your backend
      setPaymentData({
        from: claimLinkData.senderEmail,
        message: claimLinkData.message || "",
        recipientEmail: "",
      });
      setLoading(false);
    };

    if (token) {
      fetchPaymentData();
    }
  }, [token]);

  const handleClaimPayment = async () => {
    if (!isConnected) {
      openAuthModal();
    } else {
      setIsClaiming(true);
      try {
        // Call the transfer-and-cleanup API
        const transferRequest = {
          organizationId: claimLinkData.escrowSubOrgId,
          recipientAddress: address!,
          amount: escrowBalance!.amount,
          privateKey: claimLinkData.claimKeyPair.privateKey,
          publicKey: claimLinkData.claimKeyPair.publicKey,
          escrowWalletAddress: claimLinkData.walletAddress,
          destinationWalletAddress: address!,
        };

        const response = await fetch("/api/turnkey/transfer-and-cleanup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transferRequest),
        });

        const result = await response.json();

        if (result.success) {
          setStep("complete");
        } else {
          throw new Error(result.error || "Failed to claim payment");
        }
      } catch (error) {
        // Handle error appropriately - in production, use proper error reporting service
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        alert("Failed to claim payment. Please try again.");
      } finally {
        setIsClaiming(false);
      }
    }
  };

  if (loading || balanceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!paymentData || !escrowBalance || balanceError) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-red-600">
            {balanceError || "Invalid or expired claim token"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === "complete") {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Payment Claimed!
          </h2>
          <p className="text-gray-600 mb-4">
            {escrowBalance.amount} {escrowBalance.currency} has been
            successfully transferred to your wallet.
          </p>
          {address && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Transferred to</p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {formatAddress(address)}
                </Badge>
                {client?.chain?.blockExplorers?.default?.url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      if (client?.chain?.blockExplorers?.default?.url) {
                        window.open(
                          `${client.chain.blockExplorers.default.url}/address/${address}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/">
              <Button className="gap-2" size="lg">
                Send Money to Someone Else
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Payment waiting for you</CardTitle>
              <CardDescription>From {paymentData.from}</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {escrowBalance.amount}
            </div>
            <div className="text-gray-600 text-lg mb-4">
              {escrowBalance.currency}
            </div>

            {paymentData.message && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Message</p>
                <p className="font-medium">"{paymentData.message}"</p>
              </div>
            )}

            {/* Escrow Address Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Escrow Wallet</p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {formatAddress(escrowBalance.escrowAddress)}
                </Badge>
                {client?.chain?.blockExplorers?.default?.url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      if (client?.chain?.blockExplorers?.default?.url) {
                        window.open(
                          `${client?.chain?.blockExplorers?.default?.url}/address/${escrowBalance.escrowAddress}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {step === "claim" && (
            <div className="mt-6">
              <Button
                onClick={handleClaimPayment}
                disabled={isClaiming}
                className="w-full"
                size="lg"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Claiming Payment...
                  </>
                ) : isConnected ? (
                  "Claim Payment"
                ) : (
                  "Log in to Claim"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Wallet Info - shown when authenticated but not yet claimed */}
      {step === "claim" && address && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Payment will be sent to</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-8 px-2 text-gray-600 hover:text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="text-xs">Logout</span>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {formatAddress(address)}
                </Badge>
                {client?.chain?.blockExplorers?.default?.url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      if (client?.chain?.blockExplorers?.default?.url) {
                        window.open(
                          `${client.chain.blockExplorers.default.url}/address/${address}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
