"use client";

import { useSearchParams } from "next/navigation";
import ClaimHeader from "../components/claim-header";
import PaymentClaimCard from "../components/payment-claim-card";

export default function ClaimPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <ClaimHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <PaymentClaimCard token={token} />
        </div>
      </main>
    </div>
  );
}
