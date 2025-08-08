import { createClient } from "redis";
import { config } from "@repo/backend-common";

const redisClient = createClient({
  url: config.server.redis.url,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect();

export default redisClient;
