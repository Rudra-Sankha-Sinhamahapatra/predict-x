"use client";
import { useEffect, useState } from "react";

export default function GradientCanvas() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden dark:block">
      <div className="absolute inset-0 gradient-canvas opacity-100" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-[0.10] bg-[radial-gradient(circle,rgba(59,130,246,0.6),transparent_60%)]" />
      <div className="absolute -left-24 bottom-10 w-[40vw] h-[40vw] rounded-full blur-3xl opacity-[0.08] bg-[radial-gradient(circle,rgba(139,92,246,0.6),transparent_60%)]" />
      <div className="absolute -right-24 top-20 w-[40vw] h-[40vw] rounded-full blur-3xl opacity-[0.08] bg-[radial-gradient(circle,rgba(34,197,94,0.5),transparent_60%)]" />
    </div>
  );
}


