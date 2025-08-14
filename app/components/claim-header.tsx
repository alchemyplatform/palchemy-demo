import { Shield } from "lucide-react";
import Image from "next/image";

export default function ClaimHeader() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
            <Image
              src="/palchemy-favicon.png"
              alt="Palchemy Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Palchemy Payment
            </h1>
            <p className="text-sm text-gray-600">Secure payment claim</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Secured by Palchemy</span>
        </div>
      </div>
    </header>
  );
}
