"use client";

import { useSignerStatus } from "@account-kit/react";
import PaymentForm from "./components/payment-form";
import LoginCard from "./components/login-card";
import Header from "./components/header";

export default function Home() {
  const signerStatus = useSignerStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {signerStatus.isConnected ? (
          <PaymentForm />
        ) : (
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoginCard />
          </div>
        )}
      </main>
    </div>
  );
}
