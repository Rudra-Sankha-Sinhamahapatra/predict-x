import { createClient } from 'redis';
import { config } from "@repo/backend-common";

const REDIS_URL = config.server.redis.url;

const redisSubscriber = createClient({
  url: REDIS_URL,
});

redisSubscriber.on('error', (err) => console.error('Redis Sub Error', err));
redisSubscriber.on('connect', () => console.log('Redis Subscriber connected'));
redisSubscriber.on('ready', () => console.log('Redis Subscriber ready'));
redisSubscriber.on('end', () => console.log('Redis Subscriber disconnected'));

await redisSubscriber.connect();

export default redisSubscriber;
