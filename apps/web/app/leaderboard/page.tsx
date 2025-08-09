import { Card } from "../../components/ui";
import { Trophy, Medal, Award, TrendingUp, Users, DollarSign } from "lucide-react";

const mockLeaderboard = [
  { rank: 1, name: "AlphaTrader", totalWinnings: 2450, totalBets: 89, winRate: 73.2, avatar: "AT" },
  { rank: 2, name: "PredictMaster", totalWinnings: 2120, totalBets: 76, winRate: 68.4, avatar: "PM" },
  { rank: 3, name: "OddsWizard", totalWinnings: 1890, totalBets: 94, winRate: 65.9, avatar: "OW" },
  { rank: 4, name: "MarketSage", totalWinnings: 1750, totalBets: 82, winRate: 64.6, avatar: "MS" },
  { rank: 5, name: "TrendSpotter", totalWinnings: 1580, totalBets: 67, winRate: 62.7, avatar: "TS" },
  { rank: 6, name: "DataDriven", totalWinnings: 1420, totalBets: 91, winRate: 61.5, avatar: "DD" },
  { rank: 7, name: "IntuitionKing", totalWinnings: 1350, totalBets: 78, winRate: 59.0, avatar: "IK" },
  { rank: 8, name: "AnalyticsAce", totalWinnings: 1280, totalBets: 85, winRate: 58.8, avatar: "AA" },
  { rank: 9, name: "ProbabilityPro", totalWinnings: 1180, totalBets: 71, winRate: 57.7, avatar: "PP" },
  { rank: 10, name: "ForecastFox", totalWinnings: 1090, totalBets: 64, winRate: 56.2, avatar: "FF" },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
  if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
  return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
};

export default function LeaderboardPage() {
  const totalUsers = 1247;
  const totalVolume = mockLeaderboard.reduce((sum, user) => sum + user.totalWinnings, 0);
  const avgWinRate = mockLeaderboard.reduce((sum, user) => sum + user.winRate, 0) / mockLeaderboard.length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 mt-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
        <p className="text-xl text-muted-foreground">
          Top performing predictors on PredictX
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <Users className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Active Traders</div>
        </Card>
        <Card className="p-6 text-center">
          <DollarSign className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalVolume.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Winnings</div>
        </Card>
        <Card className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{avgWinRate.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Avg Win Rate</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/10">
          <h2 className="text-xl font-semibold">Top Predictors</h2>
          <p className="text-sm text-muted-foreground">Ranked by total winnings</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/2 dark:bg-white/2">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Rank</th>
                <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Trader</th>
                <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Winnings</th>
                <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Total Bets</th>
                <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Win Rate</th>
                <th className="px-6 py-4 text-sm font-medium text-muted-foreground">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {mockLeaderboard.map((user) => (
                <tr key={user.rank} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(user.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">Rank #{user.rank}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-teal-600">
                      {user.totalWinnings.toLocaleString()} tokens
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{user.totalBets}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        user.winRate >= 70 ? 'text-green-600' :
                        user.winRate >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {user.winRate.toFixed(1)}%
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        user.winRate >= 70 ? 'bg-green-500' :
                        user.winRate >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          user.winRate >= 70 ? 'bg-green-500' :
                          user.winRate >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${user.winRate}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-8 p-6 text-center bg-teal-500/5 border-teal-500/20">
        <TrendingUp className="h-12 w-12 text-teal-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">Live Leaderboard Coming Soon!</h3>
        <p className="text-sm text-muted-foreground">
          We're working on real-time leaderboard updates. The data shown above is for demonstration purposes.
        </p>
      </Card>
    </div>
  );
}
