"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  Phone,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import BalanceCard from "./balance-card";
import { generateClaimLink, ClaimLinkData } from "@/lib/utils";
import { CreateEscrowRequest } from "@/lib/types/turnkey";
import { useSmartAccountClient, useLogout } from "@account-kit/react";
import { parseEther } from "viem";

export default function PaymentForm() {
  const [recipientType, setRecipientType] = useState<"email" | "phone">(
    "email"
  );
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isCreatingEscrow, setIsCreatingEscrow] = useState(false);
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Smart account client hook
  const { client } = useSmartAccountClient({});
  const walletAddress = client?.account?.address;
  const { logout } = useLogout();

  const handleContinue = async () => {
    if (!recipient || !amount || !client) return;

    setIsCreatingEscrow(true);
    try {
      // Create escrow organization
      // SECURITY: In production, get actual user email from authentication system
      const userEmail = walletAddress
        ? `${walletAddress.slice(0, 8)}@temp.local`
        : "anonymous@temp.local";

      const escrowRequest: CreateEscrowRequest = {
        senderEmail: userEmail, // Temporary solution - implement proper user email retrieval
        organizationName: `escrow-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      const response = await fetch("/api/turnkey/create-escrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(escrowRequest),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Send the transaction to fund the escrow wallet
        const amountToSend = parseEther(amount);
        const tx = await client.sendTransaction({
          to: result.data.walletAddress,
          value: amountToSend,
          chain: client.chain,
        });

        const txReceipt = await client.waitForTransactionReceipt({
          hash: tx,
        });

        // Generate claim link data
        // ⚠️ SECURITY WARNING: This data contains sensitive information including private keys
        // In production, this data should be stored server-side securely, not embedded in URLs
        const claimLinkData: ClaimLinkData = {
          transactionId: tx,
          escrowSubOrgId: result.data.organizationId,
          claimKeyPair: result.data.claimKeyPair, // 🚨 PRIVATE KEY - INSECURE FOR DEMO ONLY
          walletAddress: result.data.walletAddress,
          senderEmail: result.data.senderEmail,
          message: message.trim() || undefined,
        };

        // Generate the claim link - SEE lib/utils.ts for security warnings
        const link = generateClaimLink(claimLinkData, window.location.origin);
        setClaimLink(link);
      } else {
        throw new Error(result.error || "Failed to create escrow");
      }
    } catch (error) {
      // Handle error appropriately - in production, use proper error reporting service
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert("Failed to create payment link. Please try again.");
    } finally {
      setIsCreatingEscrow(false);
    }
  };

  const handleCopyLink = async () => {
    if (!claimLink) return;

    try {
      await navigator.clipboard.writeText(claimLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = claimLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setClaimLink(null);
    setRecipient("");
    setAmount("");
    setMessage("");
    setCopied(false);
  };

  const handlePreviewClick = () => {
    logout();
    // Open the claim link in a new tab
    if (claimLink) {
      window.open(claimLink, "_blank");
    }
  };

  // If claim link is generated, show the success screen
  if (claimLink) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Payment Link Created!
          </h1>
          <p className="text-gray-600">
            Share this secure link with {recipient} to claim their payment
          </p>
        </div>

        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Escrow Created Successfully
            </CardTitle>
            <CardDescription className="text-green-700">
              {amount} ETH has been secured in escrow for {recipient}
              {message && (
                <>
                  <br />
                  <span className="italic">"{message}"</span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claim Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={claimLink}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-md border">
                <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Copy the claim link above</li>
                  <li>
                    Send it to {recipient} via email, text, or any messaging app
                  </li>
                  <li>
                    They'll be able to claim the {amount} ETH using their wallet
                  </li>
                  <li>You'll be notified when the payment is claimed</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handlePreviewClick}
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview Claim Page
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Send Another Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Send Payment
        </h1>
        <p className="text-gray-600">
          Send cryptocurrency to anyone via email or phone
        </p>
      </div>

      <BalanceCard client={client} walletAddress={walletAddress} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recipient Details</CardTitle>
          <CardDescription>Who are you sending to?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={recipientType === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setRecipientType("email")}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant={recipientType === "phone" ? "default" : "outline"}
              size="sm"
              onClick={() => setRecipientType("phone")}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Phone
            </Button>
          </div>

          <input
            type={recipientType === "email" ? "email" : "tel"}
            placeholder={
              recipientType === "email"
                ? "recipient@example.com"
                : "+1 (555) 123-4567"
            }
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Amount</CardTitle>
          <CardDescription>How much are you sending?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-lg"
            />
            <div className="flex items-center gap-1 px-3 py-3 border border-gray-300 rounded-md bg-gray-50">
              <span className="font-medium">ETH</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Message (Optional)</CardTitle>
          <CardDescription>
            Add a personal note with your payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            placeholder="Hey! Here's that money I owe you 😊"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={280}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              Add a note to let {recipient || "the recipient"} know what this
              payment is for
            </p>
            <span className="text-sm text-gray-400">{message.length}/280</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          className="px-8"
          disabled={!recipient || !amount || isCreatingEscrow}
          onClick={handleContinue}
        >
          {isCreatingEscrow ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Payment Link...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
