import React, { useState, useEffect } from "react";
import RaceHeader from "./RaceHeader";
import GasSpeedometer from "./GasSpeedometer";
import RaceTrack from "./RaceTrack";
import RaceControls from "./RaceControls";
import Leaderboard from "./Leaderboard";
import TransactionStatus from "./TransactionStatus";
import { useMetaMask } from "@/lib/metamask";

// Simulate connected users with a mock database
const mockConnectedUsers = [
  {
    id: "user1",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    balance: "1.25 ETH",
    isCurrentUser: true,
    position: 2,
    gasPrice: 14.2,
    score: 87,
    reward: "0.03 ETH",
    transactionSubmitted: false,
    transactionStatus: "pending",
  },
  {
    id: "user2",
    address: "0x3210fedcba9876543210fedcba9876543210fedc",
    balance: "0.75 ETH",
    isCurrentUser: false,
    position: 3,
    gasPrice: 15.8,
    score: 82,
    reward: "0.01 ETH",
    transactionSubmitted: true,
    transactionStatus: "confirmed",
  },
  {
    id: "user3",
    address: "0x9876543210fedcba9876543210fedcba98765432",
    balance: "2.5 ETH",
    isCurrentUser: false,
    position: 1,
    gasPrice: 12.3,
    score: 92,
    reward: "0.05 ETH",
    transactionSubmitted: true,
    transactionStatus: "confirmed",
  },
];

const Home = () => {
  // Use MetaMask hook
  const {
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
  } = useMetaMask();

  // State for wallet connection
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("0 ETH");

  // Update local state when MetaMask state changes
  

  // State for race - using environment variables for configuration
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(
    parseInt(import.meta.env.VITE_RACE_DURATION || "300"),
  ); // Default 5 minutes
  const [currentGasPrice, setCurrentGasPrice] = useState(45);
  const [isOptimalGasPrice, setIsOptimalGasPrice] = useState(false);

  // State for transaction
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "confirmed" | "failed"
  >("pending");
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

  // Mock user position in leaderboard
  const [userPosition, setUserPosition] = useState(2);

  // State for connected users - load from localStorage if available
  const [connectedUsers, setConnectedUsers] = useState(() => {
    const savedUsers = localStorage.getItem("connectedUsers");
    return savedUsers ? JSON.parse(savedUsers) : mockConnectedUsers;
  });

  // Current race entries for leaderboard - load from localStorage if available
  const [currentRaceEntries, setCurrentRaceEntries] = useState<any[]>(() => {
    const savedEntries = localStorage.getItem("currentRaceEntries");
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  // All-time entries for leaderboard - load from localStorage if available
  const [allTimeEntries, setAllTimeEntries] = useState<any[]>(() => {
    const savedEntries = localStorage.getItem("allTimeEntries");
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  // Dynamic currentUserPosition
  const [currentUserPosition, setCurrentUserPosition] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    setIsWalletConnected(isConnected);
    setWalletAddress(account);
    setWalletBalance(formatBalance(balance));

    // Update currentUserPosition when account or currentRaceEntries change
    if (account && currentRaceEntries.length > 0) {
      const userEntry = currentRaceEntries.find((entry) => entry.address === account);
      setCurrentUserPosition(userEntry ? userEntry.position : undefined);
    }
  }, [isConnected, account, balance, formatBalance, currentRaceEntries]);

  // Get real gas price from MetaMask and simulate changes
  useEffect(() => {
    if (!isRaceActive) return;

    // Initial gas price fetch
    const fetchInitialGasPrice = async () => {
      if (isWalletConnected) {
        try {
          const realGasPrice = await getGasPrice();
          if (realGasPrice) {
            setCurrentGasPrice(Math.round(realGasPrice));
          }
        } catch (error) {
          console.error("Error fetching initial gas price:", error);
        }
      }
    };

    fetchInitialGasPrice();

    const interval = setInterval(async () => {
      if (isWalletConnected) {
        // Try to get real gas price
        try {
          const realGasPrice = await getGasPrice();
          if (realGasPrice) {
            const newPrice = Math.round(realGasPrice);
            setCurrentGasPrice(newPrice);
            setIsOptimalGasPrice(newPrice < 40);
            return;
          }
        } catch (error) {
          console.error("Error fetching gas price in interval:", error);
        }
      }

      // Fallback to simulation if not connected or error
      const priceChange = Math.random() * 10 - 5; // -5 to +5
      const newPrice = Math.max(
        10,
        Math.min(100, currentGasPrice + priceChange),
      );
      setCurrentGasPrice(Math.round(newPrice));
      setIsOptimalGasPrice(newPrice < 40);
    }, 3000);

    return () => clearInterval(interval);
  }, [isRaceActive, isWalletConnected, getGasPrice]);

  // Update leaderboard entries when connected users change
  useEffect(() => {
    // Map connected users to leaderboard entries - always do this regardless of wallet connection
    const entries = connectedUsers
      .filter((user) => user.transactionSubmitted) // Only show users who submitted transactions
      .map((user) => ({
        position: user.position,
        address: user.address,
        gasPrice: user.gasPrice,
        score: user.score,
        reward: user.reward,
      }));

    // Sort by position
    entries.sort((a, b) => a.position - b.position);

    // Update positions based on sort order
    const updatedEntries = entries.map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));

    setCurrentRaceEntries(updatedEntries);

    // Store in localStorage to persist across refreshes
    localStorage.setItem("currentRaceEntries", JSON.stringify(updatedEntries));

    // Also update all-time entries when a race is completed
    // This simulates updating the all-time leaderboard with new race results
    if (entries.length > 0) {
      // Create a copy of entries with slightly different scores for all-time
      const allTimeUpdated = [...entries].map((entry) => ({
        ...entry,
        score: entry.score + Math.floor(Math.random() * 10), // Add some variation
      }));

      // Sort by score for all-time (highest first)
      allTimeUpdated.sort((a, b) => b.score - a.score);

      // Update positions
      const updatedAllTimeEntries = allTimeUpdated.map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));

      setAllTimeEntries(updatedAllTimeEntries);
      localStorage.setItem(
        "allTimeEntries",
        JSON.stringify(updatedAllTimeEntries),
      );
    }
  }, [connectedUsers]);

  // Simulate websocket connection for real-time updates
  useEffect(() => {
    if (!isRaceActive) return;

    // Simulate receiving updates about other users
    const websocketInterval = setInterval(() => {
      if (isWalletConnected) {
        // Simulate other users' actions
        setConnectedUsers((prevUsers) => {
          const updatedUsers = prevUsers.map((user) => {
            if (!user.isCurrentUser) {
              // Randomly update other users' data
              const randomChange = Math.random();
              if (randomChange > 0.7) {
                // Submit transaction or update status
                return {
                  ...user,
                  transactionSubmitted: true,
                  gasPrice: Math.round(Math.random() * 30 + 10), // 10-40 range
                  transactionStatus:
                    Math.random() > 0.3 ? "confirmed" : "pending",
                };
              }
            }
            return user;
          });

          // Store in localStorage to persist across refreshes
          localStorage.setItem("connectedUsers", JSON.stringify(updatedUsers));
          return updatedUsers;
        });
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(websocketInterval);
  }, [isWalletConnected, isRaceActive]);

  // Handle wallet connection using MetaMask SDK
  const handleConnectWallet = async () => {
    console.log("Attempting to connect wallet...");
    try {
      const address = await connectWallet();
      console.log("Connect wallet result:", address);
      if (address) {
        // Update connected users to mark current user
        setConnectedUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === "user1") {
              return {
                ...user,
                isCurrentUser: true,
                address: address, // Use actual MetaMask address
              };
            }
            return user;
          }),
        );
      }
    } catch (err) {
      console.error("Error in handleConnectWallet:", err);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setTransactionSubmitted(false);
    setShowTransactionStatus(false);

    // Reset connected users
    const resetUsers = mockConnectedUsers.map((user) => ({
      ...user,
      isCurrentUser: false,
    }));
    setConnectedUsers(resetUsers);

    // Update localStorage
    localStorage.setItem("connectedUsers", JSON.stringify(resetUsers));
    localStorage.removeItem("currentRaceEntries");
    // Don't remove all-time entries as they should persist across sessions
  };

  // Handle transaction submission using MetaMask SDK
  const handleSubmitTransaction = async () => {
    if (!isWalletConnected || !isRaceActive) return;

    setTransactionSubmitted(true);
    setShowTransactionStatus(true);
    setTransactionStatus("pending");

    setConnectedUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.isCurrentUser
          ? {
              ...user,
              transactionSubmitted: true,
              gasPrice: currentGasPrice,
              transactionStatus: "pending",
            }
          : user
      )
    );

    try {
      const txHash = await sendTransaction(currentGasPrice);
      if (txHash) {
        setTransactionStatus("confirmed");

        // Update connectedUsers with the new transaction data
        setConnectedUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.isCurrentUser
              ? {
                  ...user,
                  position: 0, // Temporary placeholder; will be recalculated
                  score: Math.round(100 - currentGasPrice),
                  transactionStatus: "confirmed",
                  reward: currentGasPrice < 30 ? "0.05 ETH" : currentGasPrice < 50 ? "0.03 ETH" : "0.01 ETH",
                }
              : user
          )
        );

        // Recalculate currentRaceEntries and positions
        const updatedEntries = connectedUsers
          .filter((user) => user.transactionSubmitted)
          .map((user) => ({
            position: 0, // Temporary, will be set below
            address: user.address,
            gasPrice: user.gasPrice,
            score: user.score,
            reward: user.reward,
          }))
          .sort((a, b) => a.gasPrice - b.gasPrice) // Lower gas price = better position
          .map((entry, index) => ({ ...entry, position: index + 1 }));

        setCurrentRaceEntries(updatedEntries);

        // Update currentUserPosition
        const userEntry = updatedEntries.find((entry) => entry.address === account);
        setCurrentUserPosition(userEntry ? userEntry.position : undefined);

        // Update all-time entries if needed
        if (updatedEntries.length > 0) {
          const allTimeUpdated = [...updatedEntries]
            .map((entry) => ({
              ...entry,
              score: entry.score + Math.floor(Math.random() * 10),
            }))
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({ ...entry, position: index + 1 }));
          setAllTimeEntries(allTimeUpdated);
          localStorage.setItem("allTimeEntries", JSON.stringify(allTimeUpdated));
        }
      } else {
        setTransactionStatus("failed");
      }
    } catch (error) {
      setTransactionStatus("failed");
      setConnectedUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.isCurrentUser ? { ...user, transactionStatus: "failed" } : user
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <RaceHeader
        isConnected={isWalletConnected}
        walletAddress={walletAddress}
        balance={walletBalance}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />

      <main className="container mx-auto px-4 py-8">
        {!isWalletConnected || !isRaceActive ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-3xl font-bold mb-6">
              Welcome to MetaMask Gas Race
            </h2>
            <p className="text-gray-400 mb-8 text-center max-w-2xl">
              Welcome to MetaMask Gas Race! Connect your wallet to compete in
              real-time races where you'll submit transactions at the optimal
              gas price to win rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!isWalletConnected && (
                <button
                  onClick={handleConnectWallet}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Connect MetaMask</span>
                </button>
              )}
              {isWalletConnected && !isRaceActive && (
                <button
                  onClick={() => setIsRaceActive(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Start Race</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <GasSpeedometer
                  currentGasPrice={currentGasPrice}
                  onRefresh={() => {
                    // Simulate refresh with slight price change
                    const priceChange = Math.random() * 6 - 3; // -3 to +3
                    setCurrentGasPrice(
                      Math.round(
                        Math.max(
                          10,
                          Math.min(100, currentGasPrice + priceChange),
                        ),
                      ),
                    );
                  }}
                />
                <RaceControls
                  isRaceActive={isRaceActive}
                  countdownTime={countdownTime}
                  onSubmitTransaction={handleSubmitTransaction}
                  gasPrice={currentGasPrice}
                  isOptimalGasPrice={isOptimalGasPrice}
                />
              </div>

              <RaceTrack
                currentGasPrice={currentGasPrice}
                isRaceActive={isRaceActive}
                userTransactionSubmitted={transactionSubmitted}
                lanes={connectedUsers.length}
                cars={connectedUsers.map((user, index) => ({
                  id: user.id,
                  position: user.transactionSubmitted
                    ? user.position * 20
                    : index * 25 + 10,
                  speed: 5 - index,
                  color: user.isCurrentUser
                    ? "#FF5733"
                    : [
                        "#33FF57",
                        "#3357FF",
                        "#F3FF33",
                        "#FF33F3",
                        "#33FFF3",
                        "#F3FF33",
                      ][index % 6],
                  isUser: user.isCurrentUser,
                  walletAddress: user.address,
                }))}
              />

              {showTransactionStatus && (
                <TransactionStatus
                  status={transactionStatus}
                  txHash="0x71C7656EC7ab88b098defB751B7401B5f6d8976F5d8976F"
                  errorMessage={
                    transactionStatus === "failed"
                      ? "Transaction reverted: gas limit exceeded"
                      : undefined
                  }
                />
              )}
            </div>

            <div className="lg:col-span-1">
              <Leaderboard
                currentUserPosition={userPosition}
                currentRaceEntries={currentRaceEntries}
                allTimeEntries={allTimeEntries}
                maxEntries={connectedUsers.length}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-800 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>
            GasSprint - A competitive dApp for optimizing gas prices
          </p>
          <p className="mt-2">© 2025 Gas Race Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
