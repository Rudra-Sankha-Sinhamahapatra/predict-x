import type { CalculatedOdds } from "./api";

export type OddsMessage = {
  type?: "initial" | "update";
  channel?: string;
  data?: CalculatedOdds;
} | CalculatedOdds; 

export function connectOddsSocket(topicId: string, onMessage: (data: CalculatedOdds) => void) {
  const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
  const socket = new WebSocket(`${url}?topicId=${encodeURIComponent(topicId)}`);

  socket.onmessage = (evt) => {
    try {
      const payload: OddsMessage = JSON.parse(evt.data);
      const data = (typeof payload === "object" && "data" in payload && payload.data)
        ? (payload as any).data as CalculatedOdds
        : payload as CalculatedOdds;
      if (data && (data as any).options) onMessage(data);
    } catch {
      // ignore
    }
  };

  return socket;
}


