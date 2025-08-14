import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLogout, useSignerStatus } from "@account-kit/react";
import Image from "next/image";

export default function Header() {
  const { logout } = useLogout();
  const { isConnected } = useSignerStatus();

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
            <h1 className="text-xl font-semibold text-gray-900">Palchemy</h1>
            <p className="text-sm text-gray-600">Send & Receive Crypto</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
