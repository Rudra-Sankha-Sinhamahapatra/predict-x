"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { connectOddsSocket } from "../../../lib/ws";
import type { CalculatedOdds } from "../../../lib/api";
import { Card } from "../../../components/ui";
import { toast } from "sonner";
import { vote } from "../../../lib/api";
import { auth } from "../../../lib/auth";

export default function ClientOdds({ 
  id, 
  initial, 
  optionNames, 
  onOddsUpdate 
}: { 
  id: string; 
  initial?: CalculatedOdds; 
  optionNames?: Record<string, string>;
  onOddsUpdate?: (odds: CalculatedOdds) => void;
}) {
  const [odds, setOdds] = useState<CalculatedOdds | undefined>(initial);
  const [updatedOptions, setUpdatedOptions] = useState<Set<string>>(new Set());
  const socketRef = useRef<WebSocket | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    socketRef.current = connectOddsSocket(id, (data) => {
      if (odds) {
        const changed = new Set<string>();
        data.options.forEach(newOption => {
          const oldOption = odds.options.find(o => o.optionId === newOption.optionId);
          if (oldOption && oldOption.currentPayout !== newOption.currentPayout) {
            changed.add(newOption.optionId);
          }
        });
        setUpdatedOptions(changed);
        setTimeout(() => setUpdatedOptions(new Set()), 2000);
      }
      setOdds(data);
      onOddsUpdate?.(data);
    });
    socketRef.current.onopen = () => toast.success("Live odds connected");
    socketRef.current.onerror = () => toast.error("WebSocket error");
    socketRef.current.onclose = () => toast("Live disconnected");
    return () => socketRef.current?.close();
  }, [id, onOddsUpdate]);

  const total = useMemo(() => odds?.options.reduce((a, b) => a + b.amount, 0) ?? 0, [odds]);

  async function placeBet(optionId: string) {
    try {
      if (!auth.isAuthenticated()) {
        toast.error("Please sign in first");
        return;
      }
      const amount = Number(prompt("Enter amount (tokens)", "4"));
      if (!amount || amount < 4 || amount > 50) {
        toast.error("Amount must be between 4-50 tokens");
        return;
      }
      await vote({ optionId, amount });
      toast.success("Bet placed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to place bet");
    }
  }

  if (!odds || total === 0) {
    return null;
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Live Pool</h3>
        <div className="text-sm text-muted-foreground" suppressHydrationWarning>
          {mounted && odds ? new Date(typeof odds.timestamp === 'string' ? odds.timestamp : (odds.timestamp as any)).toLocaleTimeString() : '-'}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-sm font-medium">Total staked: {total} tokens</div>
        <div className="space-y-2">
          {odds.options.map((o) => {
            const isUpdated = updatedOptions.has(o.optionId);
            return (
              <div 
                key={o.optionId} 
                className={`rounded-lg p-3 transition-all duration-500 ${
                  isUpdated 
                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' 
                    : 'bg-black/5 dark:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm truncate max-w-[60%]">
                    {optionNames?.[o.optionId] ?? o.optionId}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Live Odds:</span>
                    <span className={`font-bold tabular-nums transition-all duration-300 ${
                      isUpdated ? 'text-green-700 dark:text-green-400 scale-110' : 'text-green-600'
                    }`}>
                      {o.currentPayout.toFixed(2)}x
                    </span>
                    {isUpdated && (
                      <span className="text-xs text-green-600 animate-pulse">📈</span>
                    )}
                  </div>
                </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{o.amount} tokens staked</span>
                <span>
                  {total > 0 ? `${((o.amount / total) * 100).toFixed(1)}% of pool` : '0% of pool'}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (o.amount / total) * 100 : 0}%` }}
                />
              </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}


