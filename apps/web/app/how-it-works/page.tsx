import { Card, Button } from "../../components/ui";
import Link from "next/link";
import { Zap, Radio, Wallet, Activity, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">How PredictX Works</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Simple, transparent, and real-time. Here's how you can start predicting and winning.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-3">
            <Radio className="h-5 w-5" />
          </div>
          <h3 className="font-semibold mb-1">1. Choose a Market</h3>
          <p className="text-sm text-muted-foreground">Browse live markets and pick an outcome you believe in.</p>
        </Card>
        <Card className="p-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
            <Activity className="h-5 w-5" />
          </div>
          <h3 className="font-semibold mb-1">2. Watch Live Odds</h3>
          <p className="text-sm text-muted-foreground">Odds update in real-time based on market activity and liquidity.</p>
        </Card>
        <Card className="p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <Wallet className="h-5 w-5" />
          </div>
          <h3 className="font-semibold mb-1">3. Place Your Bet</h3>
          <p className="text-sm text-muted-foreground">Stake 4-50 tokens per bet. Higher odds = higher potential return.</p>
        </Card>
      </div>

      <Card className="p-6 mb-12">
        <h3 className="text-lg font-semibold mb-3">Odds & Payouts</h3>
        <p className="text-sm text-muted-foreground">
          PredictX uses a dynamic pool model. As more tokens are staked on an option, its payout decreases and others increase. 
          We apply a small house edge to keep payouts sustainable. Your expected return is locked at the time you place the bet.
        </p>
      </Card>

      <div className="text-center">
        <Link href="/markets">
          <Button className="px-6">
            Explore Markets
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}


