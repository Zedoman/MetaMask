import React from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

type TransactionStatus = "pending" | "confirmed" | "failed";

interface TransactionStatusProps {
  status?: TransactionStatus;
  txHash?: string;
  errorMessage?: string;
  blockExplorerUrl?: string;
}

const statusConfig = {
  pending: {
    color: "bg-yellow-100 border-yellow-300",
    textColor: "text-yellow-800",
    icon: Clock,
    label: "Transaction Pending",
    description: "Your transaction is being processed by the network.",
    badgeVariant: "secondary",
  },
  confirmed: {
    color: "bg-green-100 border-green-300",
    textColor: "text-green-800",
    icon: CheckCircle,
    label: "Transaction Confirmed",
    description: "Your transaction has been successfully confirmed!",
    badgeVariant: "default",
  },
  failed: {
    color: "bg-red-100 border-red-300",
    textColor: "text-red-800",
    icon: XCircle,
    label: "Transaction Failed",
    description: "Your transaction has failed. Please try again.",
    badgeVariant: "destructive",
  },
};

const TransactionStatus = ({
  status = "pending",
  txHash = "0x1234567890abcdef1234567890abcdef12345678",
  errorMessage = "Transaction reverted: gas limit exceeded",
  blockExplorerUrl = "https://etherscan.io/tx/",
}: TransactionStatusProps) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Truncate transaction hash for display
  const truncatedHash = txHash
    ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    : "";

  return (
    <motion.div
      className={cn(
        "w-full max-w-md p-4 rounded-lg border shadow-sm bg-white",
        config.color,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-full", config.color)}>
          <StatusIcon className={cn("w-6 h-6", config.textColor)} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={cn("font-semibold", config.textColor)}>
              {config.label}
            </h3>
            <Badge variant={config.badgeVariant as any}>{status}</Badge>
          </div>

          <p className="text-sm mt-1 text-gray-600">{config.description}</p>

          {status === "failed" && errorMessage && (
            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {txHash && (
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500 flex items-center">
                <span>TX: {truncatedHash}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => {
                          // Use the appropriate block explorer based on the network
                          const network =
                            import.meta.env.VITE_NETWORK_NAME ||
                            "Ethereum Mainnet";
                          const explorerUrl = network
                            .toLowerCase()
                            .includes("goerli")
                            ? "https://goerli.etherscan.io/tx/"
                            : network.toLowerCase().includes("sepolia")
                              ? "https://sepolia.etherscan.io/tx/"
                              : "https://etherscan.io/tx/";
                          window.open(`${explorerUrl}${txHash}`, "_blank");
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View on block explorer</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {status === "pending" && (
                <motion.div
                  className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionStatus;