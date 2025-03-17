import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Clock, Send, AlertTriangle } from "lucide-react";

interface RaceControlsProps {
  isRaceActive?: boolean;
  countdownTime?: number; // in seconds
  onSubmitTransaction?: () => void;
  gasPrice?: number;
  isOptimalGasPrice?: boolean;
}

const RaceControls = ({
  isRaceActive = false,
  countdownTime = 300, // 5 minutes in seconds
  onSubmitTransaction = () => {},
  gasPrice = 45,
  isOptimalGasPrice = false,
}: RaceControlsProps) => {
  const [timeRemaining, setTimeRemaining] = useState(countdownTime);
  const [progressValue, setProgressValue] = useState(100);

  // Calculate time in minutes and seconds
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Format time as MM:SS
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  useEffect(() => {
    let interval: number | undefined;

    if (isRaceActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          // Update progress bar
          setProgressValue((newTime / countdownTime) * 100);
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      // Race ended
      setProgressValue(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRaceActive, timeRemaining, countdownTime]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Race Controls</h2>
        <div className="flex items-center gap-2">
          <Clock className="text-blue-400" size={20} />
          <span className="text-xl font-mono text-white">{formattedTime}</span>
        </div>
      </div>

      {/* Race status indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Race Status</span>
          <span
            className={`text-sm font-medium ${isRaceActive ? "text-green-400" : "text-red-400"}`}
          >
            {isRaceActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Gas price indicator */}
      <div className="mb-6 p-3 rounded-md bg-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Current Gas Price:</span>
          <span className="font-bold text-white">{gasPrice} Gwei</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {isOptimalGasPrice ? (
            <div className="text-green-400 text-sm flex items-center">
              <span className="mr-1">✓</span> Optimal for submission
            </div>
          ) : (
            <div className="text-yellow-400 text-sm flex items-center">
              <AlertTriangle size={16} className="mr-1" /> Wait for better price
            </div>
          )}
        </div>
      </div>

      {/* Transaction submission button */}
      <Button
        onClick={onSubmitTransaction}
        disabled={!isRaceActive}
        className="w-full py-6 text-lg font-bold flex items-center justify-center gap-2"
        variant={isOptimalGasPrice ? "default" : "secondary"}
      >
        <Send size={20} />
        Submit Transaction
      </Button>

      {/* Race instructions */}
      {!isRaceActive && (
        <div className="mt-4 text-sm text-gray-400 text-center">
          Waiting for the next race to begin...
        </div>
      )}
      {isRaceActive && (
        <div className="mt-4 text-sm text-gray-400 text-center">
          Submit your transaction at the optimal gas price to win!
        </div>
      )}
    </div>
  );
};

export default RaceControls;
