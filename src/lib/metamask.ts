import { MetaMaskSDK } from "@metamask/sdk";
import type { SDKProvider } from "@metamask/sdk";
import { useState, useEffect } from "react";

// Augment the MetaMask SDK module
declare module '@metamask/sdk' {
  interface DappMetadata {
    icon?: string; // Add icon as an optional property
  }
}

// Add this to make TypeScript happy with window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

let sdk: MetaMaskSDK | null = null;



export const initializeMetaMask = () => {
  if (!sdk) {
    sdk = new MetaMaskSDK({
      dappMetadata: {
        name: "GasSprint",
        url: window.location.href,
        // icon: "https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/metamask-fox.svg",
      },
      logging: {
        developerMode: true,
      },
      checkInstallationImmediately: true,
      storage: {
        enabled: true,
      },
      // Use the existing provider if available (browser extension)
      useDeeplink: false,
      preferDesktop: true,
      injectProvider: true,
    });
  }
  return sdk;
};

export const useMetaMask = () => {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<SDKProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // First try to use the extension if available
    let ethereum = window.ethereum;

    // If no extension, use the SDK
    if (!ethereum) {
      const sdk = initializeMetaMask();
      ethereum = sdk.getProvider();
    }
    setProvider(ethereum);

    // Check if already connected
    const checkConnection = async () => {
      try {
        if (ethereum) {
          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            fetchBalance(accounts[0], ethereum);
          }
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        setError("Failed to check wallet connection");
      }
    };

    checkConnection();

    // Listen for account changes
    if (ethereum) {
      ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setIsConnected(false);
          setAccount("");
          setBalance("0");
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
          fetchBalance(accounts[0], ethereum);
        }
      });

      ethereum.on("chainChanged", () => {
        // Handle chain change if needed
        if (account) {
          fetchBalance(account, ethereum);
        }
      });
    }

    return () => {
      if (ethereum) {
        ethereum.removeAllListeners("accountsChanged");
        ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  const fetchBalance = async (address: string, provider: SDKProvider) => {
    try {
      const balance = await provider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      // Convert from wei to ETH
      const ethBalance = parseInt(balance as string, 16) / 1e18;
      setBalance(ethBalance.toFixed(4));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Failed to fetch wallet balance");
    }
  };

  const connectWallet = async () => {
    try {
      if (!provider) {
        throw new Error("MetaMask provider not available");
      }

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      })as string[];

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        fetchBalance(accounts[0], provider);
        return accounts[0];
      } else {
        throw new Error("No accounts returned from MetaMask");
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet");
      return null;
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount("");
    setBalance("0");
  };

  const getGasPrice = async () => {
    try {
      if (!provider) {
        throw new Error("MetaMask provider not available");
      }

      const gasPrice = await provider.request({
        method: "eth_gasPrice",
      });

      // Convert from wei to gwei
      return parseInt(gasPrice as string, 16) / 1e9;
    } catch (err) {
      console.error("Error getting gas price:", err);
      setError("Failed to get gas price");
      return null;
    }
  };

  const sendTransaction = async (gasPrice: number) => {
    try {
      if (!provider || !account) {
        throw new Error("MetaMask provider or account not available");
      }

      // Convert gas price from gwei to wei
      const gasPriceHex = "0x" + Math.floor(gasPrice * 1e9).toString(16);

      // Get the current gas limit estimate
      const gasLimit = await provider
        .request({
          method: "eth_estimateGas",
          params: [
            {
              from: account,
              to: account,
              value: "0x0",
            },
          ],
        })
        .catch(() => "0x5208"); // Default to 21000 gas if estimation fails

      // Create a minimal transaction (sending 0 ETH to yourself)
      const txParams = {
        from: account,
        to: account,
        value: "0x0", // 0 ETH
        gasPrice: gasPriceHex,
        gas: gasLimit, // Add explicit gas limit
        data: "0x", // Empty data field for a simple transfer
      };

      console.log("Sending transaction with params:", txParams);

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      return txHash;
    } catch (err) {
      console.error("Error sending transaction:", err);
      setError("Failed to send transaction");
      return null;
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatBalance = (balance: string) => {
    return `${balance} ETH`;
  };

  return {
    account,
    balance,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    getGasPrice,
    sendTransaction,
    formatAddress,
    formatBalance,
  };
};