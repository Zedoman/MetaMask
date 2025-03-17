import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Car {
  id: string;
  position: number;
  speed: number;
  color: string;
  isUser?: boolean;
  walletAddress?: string;
}

interface RaceTrackProps {
  currentGasPrice?: number;
  isRaceActive?: boolean;
  userTransactionSubmitted?: boolean;
  cars?: Car[];
  lanes?: number;
}

const generateDefaultCars = (count: number = 2) => {
  const defaultColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3FF33",
    "#FF33F3",
    "#33FFF3",
  ];
  const defaultAddresses = [
    "0x1234...5678",
    "0xabcd...efgh",
    "0x9876...5432",
    "0xfedc...ba98",
    "0x2468...1357",
    "0x1357...2468",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    position: 10 + i * 20,
    speed: 5 - (i % 3),
    color: defaultColors[i % defaultColors.length],
    isUser: i === 0,
    walletAddress: defaultAddresses[i % defaultAddresses.length],
  }));
};

const RaceTrack = ({
  currentGasPrice = 50, // Default gas price (medium)
  isRaceActive = true,
  userTransactionSubmitted = false,
  cars,
  lanes = 4,
}: RaceTrackProps) => {
  // Generate default cars based on lane count if not provided
  const defaultCars = cars || generateDefaultCars(Math.min(lanes, 6));
  const [raceCars, setRaceCars] = useState<Car[]>(defaultCars);

  // Update car positions based on gas price and race status
  useEffect(() => {
    if (!isRaceActive) return;

    const interval = setInterval(() => {
      setRaceCars((prevCars) => {
        return prevCars.map((car) => {
          // Calculate new speed based on gas price
          // Lower gas price = faster for user's car if transaction submitted
          let speedMultiplier = 1;

          if (car.isUser && userTransactionSubmitted) {
            // User's car moves faster with lower gas prices
            speedMultiplier = 100 / (currentGasPrice + 10);
          } else {
            // Random speed variations for other cars
            speedMultiplier = Math.random() * 0.4 + 0.8;
          }

          const newPosition = car.position + car.speed * speedMultiplier;

          // Loop cars back to start when they reach the end
          return {
            ...car,
            position: newPosition % 100,
          };
        });
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRaceActive, currentGasPrice, userTransactionSubmitted]);

  return (
    <div className="w-full h-[200px] bg-gray-800 rounded-lg overflow-hidden relative">
      {/* Track lanes */}
      {Array.from({ length: lanes }).map((_, index) => (
        <div
          key={`lane-${index}`}
          className={cn(
            "w-full h-[50px] border-b border-dashed border-gray-600 relative",
            index === 0 && "border-t",
          )}
        >
          {/* Lane number */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
            Lane {index + 1}
          </div>
        </div>
      ))}

      {/* Finish line */}
      <div className="absolute right-0 top-0 h-full w-[10px] bg-white flex flex-col">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`finish-${index}`}
            className={cn(
              "h-[25px] w-full",
              index % 2 === 0 ? "bg-black" : "bg-white",
            )}
          />
        ))}
      </div>

      {/* Cars */}
      {raceCars.map((car, index) => (
        <motion.div
          key={car.id}
          className={cn(
            "absolute top-0 h-[40px] w-[60px] flex items-center justify-center",
            car.isUser &&
              "ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800",
          )}
          style={{
            top: `${index * (200 / lanes) + 200 / lanes / 2 - 20}px`,
            left: `${car.position}%`,
          }}
          animate={{
            x: car.isUser && userTransactionSubmitted ? [0, 3, -3, 0] : 0,
          }}
          transition={{
            repeat: car.isUser && userTransactionSubmitted ? Infinity : 0,
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          {/* Car body */}
          <div
            className="w-[60px] h-[30px] rounded-md relative"
            style={{ backgroundColor: car.color }}
          >
            {/* Car windows */}
            <div className="absolute top-[5px] left-[40px] w-[15px] h-[8px] bg-blue-200 rounded-sm" />
            <div className="absolute top-[17px] left-[40px] w-[15px] h-[8px] bg-blue-200 rounded-sm" />

            {/* Car wheels */}
            <div className="absolute -bottom-[5px] left-[10px] w-[10px] h-[10px] bg-black rounded-full" />
            <div className="absolute -bottom-[5px] right-[10px] w-[10px] h-[10px] bg-black rounded-full" />

            {/* User indicator */}
            {car.isUser && (
              <div className="absolute -top-[12px] left-1/2 transform -translate-x-1/2 text-yellow-400 text-xs font-bold">
                YOU
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Gas price indicator */}
      <div className="absolute bottom-2 left-2 bg-gray-900 px-3 py-1 rounded-full text-xs text-white">
        Gas: {currentGasPrice} Gwei
      </div>

      {/* Race status */}
      <div className="absolute top-2 right-2 bg-gray-900 px-3 py-1 rounded-full text-xs">
        <span className={isRaceActive ? "text-green-400" : "text-red-400"}>
          {isRaceActive ? "Race Active" : "Race Inactive"}
        </span>
      </div>
    </div>
  );
};

export default RaceTrack;
