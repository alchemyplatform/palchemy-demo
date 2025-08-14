"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@account-kit/react";
import Image from "next/image";

export default function LoginPage() {
  const { openAuthModal } = useAuthModal();

  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-white">
      <CardHeader className="text-center space-y-4 pb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
            <Image
              src="/palchemy-favicon.png"
              alt="Palchemy Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Welcome to Palchemy
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Send and receive cryptocurrency with smart wallet technology. Log in
          to get started.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        <Button
          size="lg"
          onClick={() => openAuthModal()}
          className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
        >
          Log in
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree to Palchemy's terms of service and privacy
          policy.
        </p>
      </CardContent>
    </Card>
  );
}
