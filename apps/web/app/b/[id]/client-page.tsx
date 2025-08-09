"use client";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, AnimatedNumber, Button } from "../../../components/ui";
import { fetchBiddingById, type CalculatedOdds, type BiddingResponse } from "../../../lib/api";
import ClientOdds from "./realtime";
import BetButtons from "./bet-buttons";
import { Trophy } from "lucide-react";

export default function ClientBiddingPage({ id }: { id: string }) {
  const [data, setData] = useState<BiddingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveOdds, setLiveOdds] = useState<CalculatedOdds | undefined>(undefined);

  useEffect(() => {
    fetchBiddingById(id)
      .then((response) => {
        setData(response);
        setLiveOdds(response?.latestOdds as CalculatedOdds);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-5xl px-6 py-8">Loading...</div>;
  if (!data?.bidding) return notFound();

  const { bidding, latestOdds } = data;
  
  const currentOdds = liveOdds || latestOdds;
  const oddsMap = new Map<string, number>();
  if (currentOdds) {
    for (const o of currentOdds.options) oddsMap.set(o.optionId, o.currentPayout);
  }
  const optionNames: Record<string, string> = {};
  for (const opt of bidding.options ?? []) optionNames[opt.id] = opt.text;

  console.log("Option names mapping:", optionNames);
  console.log("Latest odds:", latestOdds);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6 mt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{bidding.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{bidding.category}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs rounded-full px-2 py-1 ${
            bidding.status === 'RESOLVED' 
              ? 'bg-blue-500/10 text-blue-600' 
              : 'bg-teal-500/10 text-teal-600'
          }`}>
            {bidding.status}
          </span>
          {bidding.status === 'RESOLVED' && (
            <Link href={`/b/${id}/results`}>
              <Button variant="ghost" className="gap-2 text-sm">
                <Trophy className="h-4 w-4" />
                View Results
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Betting Options</h3>
          {liveOdds && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Odds
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(bidding.options ?? []).map((opt) => {
            const payout = oddsMap.get(opt.id) ?? opt.payout ?? 1.5;
            const percent = Math.max(0, Math.round((payout - 1) * 100));
            const isFromLive = liveOdds && oddsMap.has(opt.id);
            return (
              <div 
                key={opt.id} 
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                  isFromLive 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{opt.text}</div>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <span className={`text-[11px] rounded-full px-2 py-0.5 ${
                      isFromLive 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                        : 'bg-teal-500/10 text-teal-400'
                    }`}>
                      {percent}% return
                    </span>
                    {isFromLive && (
                      <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                        LIVE
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">{opt.id.slice(0, 6)}…</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    isFromLive ? 'text-green-700 dark:text-green-400' : ''
                  }`}>
                    <AnimatedNumber value={payout} />
                  </div>
                  {isFromLive && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Real-time
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {bidding.status === 'OPEN' && (
        <BetButtons
          options={(bidding.options ?? []).map((o) => ({
            id: o.id,
            text: o.text,
            payout: oddsMap.get(o.id) ?? o.payout ?? 1.5,
          }))}
          isLive={!!liveOdds}
        />
      )}

      <ClientOdds 
        id={id} 
        initial={latestOdds as CalculatedOdds | undefined} 
        optionNames={optionNames}
        onOddsUpdate={setLiveOdds}
      />
    </div>
  );
}
