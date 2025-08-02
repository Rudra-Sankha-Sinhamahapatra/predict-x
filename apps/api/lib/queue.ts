import aqmp from "amqplib"
import { config } from "../config";
import type { Vote } from "@repo/backend-common"

const QUEUE_NAME = config.server.queue.names.vote;

export async function publishVoteEvent(data:Vote) {
  const connection = await aqmp.connect(config.server.queue.url);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME);
  channel.sendToQueue(QUEUE_NAME,Buffer.from(JSON.stringify(data)));

  await channel.close();
  await connection.close();
}