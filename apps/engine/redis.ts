import { createClient } from "redis";
import { config } from "@repo/backend-common";

const REDIS_URL = config.server.redis.url;

export const redisPublisher = createClient({
    url: REDIS_URL,
});

redisPublisher.on('error', (err) => console.error("Redis Pub Error: ",err));
redisPublisher.on('connect', () => console.log('Redis Publisher connected'));
redisPublisher.on('ready', () => console.log('Redis Publisher ready'));
redisPublisher.on('end', () => console.log('Redis Publisher disconnected'));

await redisPublisher.connect();