import { auth } from "./auth";

export type BettingBoard = {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  createdBy: string;
  options?: Array<{ id: string; text: string; payout?: number | null }>;
};

export type BiddingResponse = {
  message: string;
  bidding: BettingBoard;
  latestOdds?: CalculatedOdds;
};

export type CalculatedOdds = {
  topicId: string;
  options: Array<{ optionId: string; amount: number; currentPayout: number,text:string }>;
  timestamp: string | Date;
};


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export async function fetchAllBiddings(): Promise<BettingBoard[]> {
  const res = await fetch(`${API_BASE}/biddings/bidding-board/getall`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch biddings");
  const data = await res.json();
  return data.allBiddings as BettingBoard[];
}

export async function fetchBiddingById(id: string): Promise<BiddingResponse> {
  const res = await fetch(`${API_BASE}/biddings/bidding-board/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch bidding");
  return res.json();
}


export async function signup(input: { name: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE}/user/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Signup failed");
  return res.json() as Promise<{ token: string; user: { id: string; name: string; email: string } }>;
}

export async function signin(input: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/user/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Signin failed");
  return res.json() as Promise<{ token: string; userId: string }>;
}

export async function vote(params: { optionId: string; amount: number }) {
  const token = auth.getToken();
  if (!token) throw new Error("Not authenticated");
  
  const res = await fetch(`${API_BASE}/votes/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ optionId: params.optionId, amount: params.amount }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Vote failed");
  return res.json();
}

export async function fetchCurrentUser() {
  const token = auth.getToken();
  if (!token) throw new Error("Not authenticated");
  
  const res = await fetch(`${API_BASE}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json() as Promise<{ 
    message: string; 
    user: { 
      id: string; 
      name: string; 
      email: string; 
      createdAt: string;
      wallet: {
        balance: number;
      };
      stats: {
        totalBets: number;
        totalInvested: number;
        activeBets: number;
        wonBets: number;
        accountLevel: string;
        winRate: string;
      };
    } 
  }>;
}

export async function fetchBiddingResults(id: string) {
  const token = auth.getToken();
  if (!token) throw new Error("Not authenticated");
  
  const res = await fetch(`${API_BASE}/biddings/bidding-board/${id}/results`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch results");
  return res.json();
}


