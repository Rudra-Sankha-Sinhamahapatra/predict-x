import amqp from "amqplib"
import { config, type CalculatedOdds, type Vote } from "@repo/backend-common";
import { db, options, votes } from "@repo/db";
import { eq, inArray } from "drizzle-orm";
import { redisPublisher } from "./redis";

const QUEUE_NAME = config.server.queue.names.vote;
const RABBITMQ_URL = config.server.queue.url;


async function calculateOdds(vote:Vote):Promise<CalculatedOdds> {
  try {
  const allOptions = await db
  .select()
  .from(options)
  .where(eq(options.bettingId,vote.topicId));

  const optionIds = allOptions.map(o => o.id);

  const allVotes = await db
  .select()
  .from(votes)
  .where(inArray(votes.optionId,optionIds));

  const groupedVotes = new Map<string,number>();

  for (const v of allVotes) {
    groupedVotes.set(v.optionId, (groupedVotes.get(v.optionId) || 0) + v.amount);
  }

  const total = [...groupedVotes.values()].reduce((a, b) => a + b, 0);
  const HOUSE_EDGE = 0.95; // 5%

  const calculatedOptions = allOptions.map((opt) => {
    const amt = groupedVotes.get(opt.id) || 0;
    let payout: number;
    if (amt === 0) {
      payout = opt.payout || 1.5; // initial payout if no votes
    } else {
    const basePayout = total / amt;
    // Apply house edge but ensure minimum 1.1x payout
    payout = Math.max(parseFloat((basePayout * HOUSE_EDGE).toFixed(2)), 1.1);
    }

    return {
      optionId: opt.id,
      amount: amt,
      currentPayout: payout,
    };
  });
  console.log(`📊 Odds calculation: Total pool = ${total}, Options = ${calculatedOptions.map(o => `${o.optionId}: ${o.amount} tokens → ${o.currentPayout}x`).join(', ')}`);
  return {
    topicId: vote.topicId,
    options: calculatedOptions,
    timestamp: new Date(),
  };
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function processVote(vote: Vote) {
    try {
      console.log('Processing vote:', vote);
      
      const newOdds = await calculateOdds(vote);
      
      // Push to Redis/PubSub for API to consume
      const redisChannel = `odds:${vote.topicId}`;
      await redisPublisher.publish(redisChannel,JSON.stringify(newOdds));

      console.log('Calculated new odds:', newOdds);
      console.log(`Published new odds to Redis channel ${redisChannel}`);
    } catch (error) {
      console.error('Error processing vote:', error);
    }
  }

  async function startWorker() {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_NAME, { durable: true });
      
      console.log('Engine worker connected to RabbitMQ');
      console.log('Listening for votes on queue:', QUEUE_NAME);
  
      channel.consume(QUEUE_NAME, async (msg) => {
        if (msg) {
          const vote = JSON.parse(msg.content.toString()) as Vote;
          await processVote(vote);
          channel.ack(msg);
        }
      });

      process.on('SIGTERM', async () => {
        console.log('Shutting down engine worker...');
        await channel.close();
        await connection.close();
        process.exit(0);
      });
  
    } catch (error) {
      console.error('Failed to start worker:', error);
      process.exit(1);
    }

}

startWorker().catch(console.error);