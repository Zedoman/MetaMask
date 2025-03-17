import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Trophy, Clock, ExternalLink } from "lucide-react";

interface LeaderboardEntry {
  position: number;
  address: string;
  gasPrice: number;
  score: number;
  reward?: string;
}

interface LeaderboardProps {
  currentRaceEntries?: LeaderboardEntry[];
  allTimeEntries?: LeaderboardEntry[];
  currentUserPosition?: number;
  maxEntries?: number;
}

const truncateAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const LeaderboardTable: React.FC<{
  entries: LeaderboardEntry[];
  currentUserPosition?: number;
  isSimplified?: boolean;
}> = ({ entries = [], currentUserPosition, isSimplified = false }) => {
  if (isSimplified) {
    return (
      <div className="overflow-hidden rounded-lg bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-100 text-gray-600">
              <th className="px-4 py-3 text-left text-xs font-medium">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-medium">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium">Gas</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Score</th>
              <th className="px-4 py-3 text-right text-xs font-medium">
                Reward
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {entries.map((entry) => (
              <tr
                key={entry.address}
                className={`border-b ${entry.position === currentUserPosition ? "bg-blue-50" : ""}`}
              >
                <td className="px-4 py-3 text-sm font-medium">
                  {entry.position}
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  {truncateAddress(entry.address)}
                </td>
                <td className="px-4 py-3 text-sm">{entry.gasPrice}</td>
                <td className="px-4 py-3 text-sm">{entry.score}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                  {entry.reward || "-"}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No entries yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium">Pos</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Address</th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Gas (Gwei)
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Reward</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.address}
              className={`border-b hover:bg-muted/50 ${entry.position === currentUserPosition ? "bg-primary/10" : ""}`}
            >
              <td className="px-4 py-3 text-sm">{entry.position}</td>
              <td className="px-4 py-3 text-sm font-mono">
                {truncateAddress(entry.address)}
              </td>
              <td className="px-4 py-3 text-sm">{entry.gasPrice}</td>
              <td className="px-4 py-3 text-sm">{entry.score}</td>
              <td className="px-4 py-3 text-sm">
                {entry.reward ? (
                  <div className="flex items-center gap-1">
                    <span>{entry.reward}</span>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No entries yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const generateDefaultEntries = (count: number = 5) => {
  const defaultAddresses = [
    "0x9876543210fedcba9876543210fedcba98765432",
    "0xfedcba9876543210fedcba9876543210fedcba98",
    "0x3210fedcba9876543210fedcba9876543210fedc",
    "0x210fedcba9876543210fedcba9876543210fedcba",
    "0x0fedcba9876543210fedcba9876543210fedcba98",
    "0x1fedcba9876543210fedcba9876543210fedcba9",
    "0x2fedcba9876543210fedcba9876543210fedcba8",
    "0x3fedcba9876543210fedcba9876543210fedcba7",
    "0x4fedcba9876543210fedcba9876543210fedcba6",
    "0x5fedcba9876543210fedcba9876543210fedcba5",
  ];

  return Array.from(
    { length: Math.min(count, defaultAddresses.length) },
    (_, i) => ({
      position: i + 1,
      address: defaultAddresses[i],
      gasPrice: 10 + i * 0.8,
      score: 450 - i * 25,
      reward: `${0.5 - i * 0.1 > 0 ? (0.5 - i * 0.1).toFixed(2) : 0.05} ETH`,
    }),
  );
};

const Leaderboard: React.FC<LeaderboardProps> = ({
  currentRaceEntries = [],
  allTimeEntries,
  currentUserPosition, // Now dynamic
  maxEntries = 5,
}) => {
  const [allTimeLeaderboard, setAllTimeLeaderboard] = React.useState(() => {
    if (allTimeEntries && allTimeEntries.length > 0) return allTimeEntries;
    const savedEntries = localStorage.getItem("allTimeEntries");
    if (savedEntries) return JSON.parse(savedEntries);
    return generateDefaultEntries(maxEntries);
  });

  React.useEffect(() => {
    if (allTimeEntries && allTimeEntries.length > 0) {
      setAllTimeLeaderboard(allTimeEntries);
    }
  }, [allTimeEntries]);

  return (
    <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="current"
            className="rounded-md py-2 text-base font-medium data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
          >
            Current Race
          </TabsTrigger>
          <TabsTrigger
            value="alltime"
            className="rounded-md py-2 text-base font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
          >
            All-Time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                Live
              </span>
            </div>
            <span className="text-sm text-gray-500 font-medium">
              Ends in 05:00
            </span>
          </div>

          <LeaderboardTable
            entries={currentRaceEntries}
            currentUserPosition={currentUserPosition}
            isSimplified={true}
          />

          <div className="flex justify-between items-center mt-4 text-sm">
          
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <span>View on Etherscan</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="alltime" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Season 1 Rankings</span>
            <span className="text-sm text-gray-500">Total Races: 156</span>
          </div>

          <LeaderboardTable entries={allTimeLeaderboard} isSimplified={true} />

          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            >
              View Full Rankings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
