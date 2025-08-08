import Redis from "ioredis";
import { WebSocketServer } from "ws";
import { config } from "../../packages/backend-common";
import url from "url";
import { db, betting_board } from "@repo/db";
import { eq } from "drizzle-orm";

const PORT = config.server.ws.url || 8080;
const REDIS_URL = config.server.redis.url;

const wss = new WebSocketServer({ port: Number(PORT) });
const redisReader = new Redis(REDIS_URL);

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', async(ws, req) => {
    console.log("New Client connected");
    const query = url.parse(req.url || "", true).query;
    const topicId = query.topicId as string;

    if (!topicId) {
        ws.send(JSON.stringify({ error: "topicId query param is required" }));
        ws.close();
        return;
    }

    console.log(`Client connected for topicId=${topicId}`);

    const redisOddsKey = `latest_odds:${topicId}`;
    let latestOddsString = await redisReader.get(redisOddsKey);

    if(!latestOddsString) {
        const getBidding = await db.query.betting_board.findFirst({
            where: eq(betting_board.id, topicId),
            with: { options: true }
        });

        if (!getBidding) {
            ws.send(JSON.stringify({
                type: "error",
                message: "Bidding not found"
            }));
            ws.close();
            return;
        }
        const initialOdds = {
            topicId,
            options: getBidding.options.map(opt => ({
                optionId: opt.id,
                amount: 0,
                currentPayout: opt.payout || 1.5,
            })),
            timestamp: new Date(),
        };

        await redisReader.set(redisOddsKey, JSON.stringify(initialOdds));
        latestOddsString = JSON.stringify(initialOdds);
    }

    ws.send(JSON.stringify({
        type: "initial",
        channel: `odds:${topicId}`,
        data: latestOddsString ? JSON.parse(latestOddsString) : null
    }));

    const redisChannel = `odds:${topicId}`;
    const sub = new Redis(REDIS_URL);
    await sub.subscribe(redisChannel);

    sub.on("message", (channel, message) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                type: "update",
                channel,
                data: JSON.parse(message)
            }));
        }
    });

    ws.on('message', (msg) => {
        console.log('Message from client:',msg.toString());
    });

    ws.on('close', () => {
        console.log("Client disconnected");
        sub.unsubscribe(`odds:${topicId}`);
        sub.quit();
    });
});
