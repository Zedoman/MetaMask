import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Gauge } from "lucide-react";

interface GasSpeedometerProps {
  currentGasPrice?: number;
  lowGasThreshold?: number;
  mediumGasThreshold?: number;
  highGasThreshold?: number;
  maxGasPrice?: number;
  onRefresh?: () => void;
}

const GasSpeedometer = ({
  currentGasPrice = 45,
  lowGasThreshold = 30,
  mediumGasThreshold = 60,
  highGasThreshold = 90,
  maxGasPrice = parseInt(import.meta.env.VITE_MAX_GAS_PRICE || "120"),
  onRefresh = () => {},
}: GasSpeedometerProps) => {
  const [prevGasPrice, setPrevGasPrice] = useState(currentGasPrice);
  const [priceDirection, setPriceDirection] = useState<
    "up" | "down" | "stable"
  >("stable");

  useEffect(() => {
    if (currentGasPrice > prevGasPrice) {
      setPriceDirection("up");
    } else if (currentGasPrice < prevGasPrice) {
      setPriceDirection("down");
    } else {
      setPriceDirection("stable");
    }
    setPrevGasPrice(currentGasPrice);
  }, [currentGasPrice, prevGasPrice]);

  // Calculate needle rotation based on current gas price
  const calculateRotation = () => {
    const percentage = (currentGasPrice / maxGasPrice) * 100;
    // Convert percentage to degrees (0% = -90deg, 100% = 90deg)
    return Math.min(Math.max(percentage * 1.8 - 90, -90), 90);
  };

  // Determine gas price zone color
  const getGasPriceColor = () => {
    if (currentGasPrice <= lowGasThreshold) return "text-green-500";
    if (currentGasPrice <= mediumGasThreshold) return "text-yellow-500";
    if (currentGasPrice <= highGasThreshold) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-slate-800 w-full max-w-[500px] h-[300px]">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-xl font-bold text-white">Gas Price Speedometer</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="text-black border-white hover:bg-slate-700"
        >
          Refresh
        </Button>
      </div>

      <div className="relative w-full h-40">
        {/* Speedometer background */}
        <div className="absolute w-full h-40 bg-slate-700 rounded-t-full overflow-hidden">
          {/* Low gas zone */}
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-green-500/20 rounded-tl-full"></div>
          {/* Medium gas zone */}
          <div className="absolute bottom-0 left-1/3 w-1/3 h-full bg-yellow-500/20"></div>
          {/* High gas zone */}
          <div className="absolute bottom-0 right-0 w-1/3 h-full bg-red-500/20 rounded-tr-full"></div>
        </div>

        {/* Speedometer markings */}
        <div className="absolute bottom-0 w-full flex justify-between px-4">
          <span className="text-xs text-green-400">0</span>
          <span className="text-xs text-yellow-400">{mediumGasThreshold}</span>
          <span className="text-xs text-red-400">{maxGasPrice}</span>
        </div>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-32 bg-white origin-bottom transform -translate-x-1/2 transition-transform duration-500"
          style={{
            transform: `translateX(-50%) rotate(${calculateRotation()}deg)`,
          }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-white"></div>
        </div>

        {/* Center point */}
        <div className="absolute bottom-0 left-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-white transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <Gauge className="mr-2 text-white" size={24} />
        <span className="text-2xl font-bold mr-2">
          <span className={cn("transition-colors", getGasPriceColor())}>
            {currentGasPrice}
          </span>
          <span className="text-white text-sm ml-1">Gwei</span>
        </span>

        {priceDirection === "up" && (
          <ArrowUp className="text-red-500 animate-pulse" size={20} />
        )}
        {priceDirection === "down" && (
          <ArrowDown className="text-green-500 animate-pulse" size={20} />
        )}
      </div>
    </div>
  );
};

export default GasSpeedometer;
