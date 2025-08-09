"use client";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

export function Card(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-xl border border-black/5 bg-white/50 dark:bg-white/5 shadow-card backdrop-blur p-5", props.className)}>{props.children}</div>;
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "gradient" }) {
  const { className, variant = "primary", ...rest } = props;
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles = variant === "primary"
    ? "bg-gradient-to-r from-teal-500 to-indigo-500 text-white hover:opacity-90 focus:ring-teal-500"
    : variant === "gradient"
    ? "text-white bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:brightness-110"
    : "bg-transparent hover:bg-black/5 dark:hover:bg-white/10";
  return <button className={cn(base, styles, className)} {...rest} />;
}

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const current = theme === "system" ? systemTheme : theme;
  const isDark = current === "dark";
  return (
    <Button aria-label="Toggle theme" variant="ghost" onClick={() => setTheme(isDark ? "light" : "dark")} className="h-9 w-9 p-0" suppressHydrationWarning>
      {!mounted ? null : isDark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}

export function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ backgroundColor: "rgba(20,184,166,0.25)" }}
      animate={{ backgroundColor: "rgba(0,0,0,0)" }}
      transition={{ duration: 0.8 }}
      className="px-1 rounded"
    >
      {value.toFixed(2)}x
    </motion.span>
  );
}


