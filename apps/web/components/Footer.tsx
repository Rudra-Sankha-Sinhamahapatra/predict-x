import Link from "next/link";
import { TrendingUp, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-slate-600 dark:bg-black/60 bg-white/50 dark:bg-[#090f1a]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <TrendingUp className="h-6 w-6 text-teal-500" />
              <span className="gradient-brand bg-clip-text text-transparent">PredictX</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              The world's most advanced prediction market platform. Bet on real-time events with live odds and instant payouts.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <span className="text-sm">💬</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block hover:text-teal-500 transition-colors">Markets</Link>
              <Link href="/leaderboard" className="block hover:text-teal-500 transition-colors">Leaderboard</Link>
              <Link href="/how-it-works" className="block hover:text-teal-500 transition-colors">How it works</Link>
              <Link href="/api-docs" className="block hover:text-teal-500 transition-colors">API Docs</Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-2 text-sm">
              <Link href="/help" className="block hover:text-teal-500 transition-colors">Help Center</Link>
              <Link href="/terms" className="block hover:text-teal-500 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="block hover:text-teal-500 transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="block hover:text-teal-500 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-black/5 dark:border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © 2025 PredictX. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for the prediction community
          </p>
        </div>
      </div>
    </footer>
  );
}
