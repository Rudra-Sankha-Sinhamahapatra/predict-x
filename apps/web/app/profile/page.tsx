"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "../../components/ui";
import { fetchCurrentUser } from "../../lib/api";
import { auth } from "../../lib/auth";
import { toast } from "sonner";
import { User, Mail, Calendar, TrendingUp, Trophy, DollarSign, LogOut } from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  wallet: {
    balance: number;
  };
  stats: {
    totalBets: number;
    totalInvested: number;
    activeBets: number;
    wonBets: number;
    accountLevel: string;
    winRate: string;
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/auth");
      return;
    }

    fetchCurrentUser()
      .then((res) => setUser(res.user))
      .catch((err) => {
        toast.error("Failed to load profile");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const signOut = () => {
    auth.removeToken();
    toast.success("Signed out successfully");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-black/5 dark:bg-white/10 rounded animate-pulse" />
          <Card className="p-6">
            <div className="space-y-4">
              <div className="h-20 bg-black/5 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-black/5 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-black/5 dark:bg-white/10 rounded animate-pulse w-3/4" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Card className="p-12 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Profile Not Found</h3>
          <p className="text-muted-foreground mb-6">
            We couldn't load your profile. Please try signing in again.
          </p>
          <Button onClick={() => router.push("/auth")}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 mt-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-xl text-muted-foreground">
          Manage your account and view your prediction history
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">Prediction Trader</p>
                </div>
              </div>
              <Button variant="ghost" onClick={signOut} className="gap-2 text-red-500 hover:text-red-600">
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                  <div className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button variant="ghost" className="justify-start gap-3 h-auto p-4">
                <TrendingUp className="h-5 w-5 text-teal-500" />
                <div className="text-left">
                  <div className="font-medium">Browse Markets</div>
                  <div className="text-sm text-muted-foreground">Find new prediction opportunities</div>
                </div>
              </Button>
              <Button variant="ghost" className="justify-start gap-3 h-auto p-4">
                <Trophy className="h-5 w-5 text-teal-500" />
                <div className="text-left">
                  <div className="font-medium">View Leaderboard</div>
                  <div className="text-sm text-muted-foreground">See top predictors</div>
                </div>
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Trading Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-teal-500" />
                  <span className="text-sm">Total Invested</span>
                </div>
                <span className="font-semibold">{user.stats.totalInvested} tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-500" />
                  <span className="text-sm">Active Bets</span>
                </div>
                <span className="font-semibold">{user.stats.activeBets}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-teal-500" />
                  <span className="text-sm">Won Bets</span>
                </div>
                <span className="font-semibold">{user.stats.wonBets}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-teal-500" />
                  <span className="text-sm">Win Rate</span>
                </div>
                <span className="font-semibold">{user.stats.winRate}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Account Level</span>
                <span className={`text-sm font-medium ${
                  user.stats.accountLevel === 'Expert' ? 'text-purple-500' :
                  user.stats.accountLevel === 'Advanced' ? 'text-blue-500' :
                  user.stats.accountLevel === 'Intermediate' ? 'text-yellow-500' :
                  'text-teal-500'
                }`}>
                  {user.stats.accountLevel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Bets</span>
                <span className="text-sm font-medium">{user.stats.totalBets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Wallet Balance</span>
                <span className="text-sm font-medium text-green-500">{user.wallet.balance} tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Verification</span>
                <span className="text-sm font-medium text-green-500">Verified</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm">Start making predictions to see your activity here</p>
        </div>
      </Card>
    </div>
  );
}
