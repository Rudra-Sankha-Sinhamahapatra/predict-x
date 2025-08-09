"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "./ui";
import { signin, signup } from "../lib/api";
import { auth } from "../lib/auth";
import { toast } from "sonner";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await signup({ name, email, password });
        auth.setToken(res.token);
        toast.success("Account created successfully!");
        router.push("/profile");
      } else {
        const res = await signin({ email, password });
        auth.setToken(res.token);
        toast.success("Welcome back!");
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto shadow-xl shadow-black/30 dark:shadow-black/40 bg-white/80 dark:bg-[#0e1627]/80 backdrop-blur">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{mode === "signin" ? "Sign in" : "Create account"}</h3>
          <button type="button" className="text-xs text-teal-500" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Need an account?" : "Have an account?"}</button>
        </div>
        {mode === "signup" && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-lg bg-transparent border border-black/10 dark:border-white/10 px-3 py-2" required />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-lg bg-transparent border border-black/10 dark:border-white/10 px-3 py-2" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full rounded-lg bg-transparent border border-black/10 dark:border-white/10 px-3 py-2" required />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : (mode === "signin" ? "Sign in" : "Sign up")}
        </Button>
      </form>
    </Card>
  );
}


