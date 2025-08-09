"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle, Button } from "./ui";
import { auth } from "../lib/auth";
import { TrendingUp, User, LogOut } from "lucide-react";

export default function Header() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    setIsSignedIn(auth.isAuthenticated());
    const unsubscribe = auth.subscribe(() => {
      setIsSignedIn(auth.isAuthenticated());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const signOut = () => {
    auth.removeToken();
    setIsSignedIn(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black backdrop-blur-md border-b border-black/5 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <TrendingUp className="h-6 w-6 text-teal-500" />
            <span className="gradient-brand bg-clip-text text-transparent">PredictX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/markets" className="hover:text-teal-500 transition-colors">Markets</Link>
            <Link href="/leaderboard" className="hover:text-teal-500 transition-colors">Leaderboard</Link>
            <Link href="/how-it-works" className="hover:text-teal-500 transition-colors">How it works</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" className="gap-2">
                  <User size={16} />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" onClick={signOut} className="gap-2">
                <LogOut size={16} />
                Sign out
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


