"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "../../../../components/ui";
import { fetchBiddingResults } from "../../../../lib/api";
import { auth } from "../../../../lib/auth";
import { toast } from "sonner";
import { Trophy, Users, DollarSign, ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

type BiddingResults = {
  message: string;
  bidding: {
    id: string;
    title: string;
    category: string;
    createdBy: string;
    createdAt: string;
    resolvedAt: string;
    status: string;
  };
  results: Array<{
    option: {
      id: string;
      text: string;
      payout: number;
    };
    votes: Array<{
      user: { id: string; name: string };
      amount: number;
      timestamp: string;
    }>;
    stats: {
      totalVotes: number;
      totalAmount: number;
    };
  }>;
};

async function ResultsPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultsPage id={id} />;
}

export default ResultsPageWrapper;

function ResultsPage({ id }: { id: string }) {
  const router = useRouter();
  const [results, setResults] = useState<BiddingResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/auth");
      return;
    }

    fetchBiddingResults(id)
      .then(setResults)
      .catch((err) => {
        toast.error(err.message || "Failed to load results");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

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

  if (!results) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Card className="p-12 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Results Not Available</h3>
          <p className="text-muted-foreground mb-6">
            This market may not be resolved yet or results couldn't be loaded.
          </p>
          <Link href={`/b/${id}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Market
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { bidding, results: optionResults } = results;
  const totalVolume = optionResults.reduce((sum, r) => sum + r.stats.totalAmount, 0);
  const totalParticipants = new Set(
    optionResults.flatMap(r => r.votes.map(v => v.user.id))
  ).size;

  const winningOption = optionResults.reduce((max, current) => 
    current.stats.totalAmount > max.stats.totalAmount ? current : max
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 mt-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/b/${id}`}>
            <Button variant="ghost" className="gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Market
            </Button>
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-2">{bidding.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-sm">
            {bidding.status}
          </span>
          <span>{bidding.category}</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Resolved {new Date(bidding.resolvedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <DollarSign className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalVolume}</div>
          <div className="text-sm text-muted-foreground">Total Volume</div>
        </Card>
        <Card className="p-6 text-center">
          <Users className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalParticipants}</div>
          <div className="text-sm text-muted-foreground">Participants</div>
        </Card>
        <Card className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{optionResults.length}</div>
          <div className="text-sm text-muted-foreground">Options</div>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Results by Option</h2>
        
        {optionResults
          .sort((a, b) => b.stats.totalAmount - a.stats.totalAmount)
          .map((result, index) => {
            const isWinner = result.option.id === winningOption.option.id;
            const percentage = totalVolume > 0 ? (result.stats.totalAmount / totalVolume) * 100 : 0;
            
            return (
              <Card key={result.option.id} className={`p-6 ${isWinner ? 'ring-2 ring-teal-500 bg-teal-500/5' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isWinner ? 'bg-teal-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{result.option.text}</h3>
                      {isWinner && (
                        <div className="flex items-center gap-1 text-teal-600 text-sm">
                          <Trophy className="h-4 w-4" />
                          <span>Winning Option</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Payout Rate</div>
                    <div className="font-bold">{result.option.payout}x</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Staked</div>
                    <div className="font-semibold">{result.stats.totalAmount} tokens</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Votes</div>
                    <div className="font-semibold">{result.stats.totalVotes}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Market Share</div>
                    <div className="font-semibold">{percentage.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Stake</div>
                    <div className="font-semibold">
                      {result.stats.totalVotes > 0 
                        ? (result.stats.totalAmount / result.stats.totalVotes).toFixed(1)
                        : '0'
                      } tokens
                    </div>
                  </div>
                </div>

                <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full ${isWinner ? 'bg-teal-500' : 'bg-muted-foreground'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {result.votes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Individual Votes ({result.votes.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.votes
                        .sort((a, b) => b.amount - a.amount)
                        .map((vote, vIndex) => (
                          <div key={vIndex} className="flex items-center justify-between py-2 px-3 bg-black/5 dark:bg-white/5 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                {vote.user.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{vote.user.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{vote.amount} tokens</span>
                              {isWinner && (
                                <span className="text-green-600 text-xs">
                                  +{(vote.amount * result.option.payout).toFixed(1)} return
                                </span>
                              )}
                              <span className="text-muted-foreground text-xs">
                                {new Date(vote.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}
