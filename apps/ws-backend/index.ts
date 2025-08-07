import Redis from "ioredis";
import { WebSocketServer } from "ws";
import { config } from "../../packages/backend-common";

const PORT = config.server.ws.url || 8080;
const REDIS_URL = config.server.redis.url;

const wss = new WebSocketServer({ port: Number(PORT) });
const redis = new Redis(REDIS_URL);
const CHANNEL_PREFIX = "odds:";

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
    console.log("New Client connected");

    ws.on('message', (msg) => {
        console.log('Message from client:',msg.toString());
    });

    ws.on('close', () => {
        console.log("Client disconnected");
    });
});

redis.psubscribe(`${CHANNEL_PREFIX}*`, (err, count) => {
    if (err) console.error("Redis psubscribe failed",err);
    else console.log(`Subscribed to ${CHANNEL_PREFIX}* channels`);
});

redis.on("pmessage", (pattern,channel,message) => {
    console.log(`New odds on ${channel}:`,message);

    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ channel, data: JSON.parse(message) }));
        }
    });
});
