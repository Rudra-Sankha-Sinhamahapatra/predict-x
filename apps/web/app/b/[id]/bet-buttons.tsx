"use client";
import { useState } from "react";
import { Button, Card } from "../../../components/ui";
import { vote } from "../../../lib/api";
import { auth } from "../../../lib/auth";
import { toast } from "sonner";

type Opt = { id: string; text: string; payout: number };

export default function BetButtons({ options, isLive }: { options: Opt[]; isLive?: boolean }) {
  const [amount, setAmount] = useState<number>(10);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const handleAmountChange = (value: number) => {
    if (value < 4) setAmount(4);
    else if (value > 50) setAmount(50);
    else setAmount(value);
  };
  
  async function place() {
    if (!selectedOption) return;
    if (amount < 4) return toast.error("Minimum bet is 4 tokens");
    if (amount > 50) return toast.error("Maximum bet is 50 tokens");
    
    try {
      if (!auth.isAuthenticated()) return toast.error("Please sign in first");
      await vote({ optionId: selectedOption, amount });
      toast.success("Bet placed successfully!");
      setSelectedOption(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to place bet");
    }
  }
  
  return (
    <Card>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Place your bet</h3>
          {isLive && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Odds
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Bet Amount</label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="number" 
                min={4} 
                max={50}
                value={amount} 
                onChange={(e) => handleAmountChange(Number(e.target.value))} 
                className="w-32 rounded-lg bg-transparent border border-black/10 dark:border-white/10 px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              />
            </div>
            <span className="text-sm text-muted-foreground">tokens (4-50)</span>
            <div className="flex gap-1 ml-2">
              {[4, 10, 25, 50].map(amt => (
                <button 
                  key={amt} 
                  onClick={() => setAmount(amt)}
                  className={`px-2 py-1 text-xs rounded ${amount === amt ? 'bg-teal-500 text-white' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'}`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Choose Option</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {options.map((o) => (
              <button 
                key={o.id} 
                onClick={() => setSelectedOption(o.id)} 
                className={`rounded-xl border px-4 py-3 text-left transition-all ${
                  selectedOption === o.id 
                    ? 'border-teal-500 bg-teal-500/10 ring-2 ring-teal-500/20' 
                    : 'border-black/10 dark:border-white/10 hover:shadow-md hover:border-teal-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{o.text}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isLive ? 'text-green-600 dark:text-green-400' : 'text-teal-500'}`}>
                      {o.payout.toFixed(2)}x
                    </span>
                    {isLive && (
                      <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                        LIVE
                      </span>
                    )}
                  </div>
                </div>
                {selectedOption === o.id && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Potential return: {(amount * o.payout).toFixed(0)} tokens
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {selectedOption && (
          <Button onClick={place} className="w-full">
            Place Bet: {amount} tokens → {(amount * options.find(o => o.id === selectedOption)!.payout).toFixed(0)} tokens
          </Button>
        )}
      </div>
    </Card>
  );
}


