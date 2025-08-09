import Link from "next/link";
import { Card, Button } from "../components/ui";
import { fetchAllBiddings } from "../lib/api";
import { TrendingUp, Zap, Shield, Users, ArrowRight } from "lucide-react";

export default async function Home() {
  const biddings = await fetchAllBiddings().catch(() => []);
  
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="hidden dark:block absolute inset-0 gradient-canvas-dark" />
          <div className="block dark:hidden absolute inset-0 gradient-brand opacity-10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            Predict the Future,
            <br />
            <span className="gradient-brand bg-clip-text text-transparent">Win Big</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the world's most advanced prediction market. Bet on real-time events with live odds, instant payouts, and complete transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth">
              <Button className="text-lg px-8 py-3">
                Start Predicting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="ghost" className="text-lg px-8 py-3">
                How it works
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { label: 'Live Markets', value: '24/7' },
              { label: 'Active Users', value: '1000+' },
              { label: 'Volume Traded', value: '$10M+' },
            ].map(({label, value}) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 p-6">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black/2 dark:bg-transparent">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose PredictX?</h2>
            <p className="text-xl text-muted-foreground">The most advanced prediction platform on the web</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-white/70 dark:bg-white/5 border-white/10">
              <Zap className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Odds</h3>
              <p className="text-muted-foreground">Live odds updates powered by advanced algorithms and real user activity.</p>
            </Card>
            <Card className="p-8 text-center bg-white/70 dark:bg-white/5 border-white/10">
              <Shield className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Fair</h3>
              <p className="text-muted-foreground">Blockchain-backed transparency with instant, guaranteed payouts.</p>
            </Card>
            <Card className="p-8 text-center bg-white/70 dark:bg-white/5 border-white/10">
              <Users className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">Join thousands of traders in the most active prediction community.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Active Markets</h2>
            <Link href="/markets">
              <Button variant="ghost">View All Markets <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {biddings.length === 0 ? (
              <Card className="col-span-full p-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No active markets</h3>
                <p className="text-muted-foreground mb-4">Be the first to create a prediction market!</p>
                <Button>Create Market</Button>
              </Card>
            ) : (
              biddings.slice(0, 6).map((b) => (
                <Link key={b.id} href={`/b/${b.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 line-clamp-2">{b.title}</h3>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{b.category}</p>
                        </div>
                        <span className="text-xs rounded-full bg-teal-500/10 text-teal-600 px-2 py-1 ml-2 whitespace-nowrap">
                          {b.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{(b.options?.length ?? 0)} options</span>
                        <span className="text-teal-500 font-medium">View Market →</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
