import React, { useState } from "react";
import { Button } from "./ui/button";
import { Wallet, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";

interface RaceHeaderProps {
  isConnected?: boolean;
  walletAddress?: string;
  balance?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const RaceHeader = ({
  isConnected = false,
  walletAddress = "0x1234...5678",
  balance = "0.5 ETH",
  onConnect = () => {},
  onDisconnect = () => {},
}: RaceHeaderProps) => {
  const [hovering, setHovering] = useState(false);

  return (
    <header className="w-full h-20 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md">
      <div className="flex items-center space-x-3">
        <Fuel className="h-8 w-8 text-green-400" />
        <h1 className="text-2xl font-bold">GasSprint</h1>
      </div>

      <div className="flex items-center space-x-4">
        {isConnected ? (
          <div
            className="flex items-center space-x-3 bg-slate-800 rounded-lg p-2 pr-4 cursor-pointer transition-all"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={onDisconnect}
          >
            <div className="h-9 w-9 rounded-full bg-green-400 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-slate-900" />
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-sm transition-all",
                  hovering ? "text-red-400" : "text-gray-300",
                )}
              >
                {hovering ? "Disconnect" : walletAddress}
              </span>
              <span className="text-xs text-green-400 font-medium">
                {balance}
              </span>
            </div>
          </div>
        ) : (
          <Button
            onClick={onConnect}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default RaceHeader;
