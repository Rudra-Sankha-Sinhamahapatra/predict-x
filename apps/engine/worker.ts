import amqp from "amqplib"
import { config, type Vote } from "@repo/backend-common";

const QUEUE_NAME = config.server.queue.names.vote;
const RABBITMQ_URL = config.server.queue.url;

interface CalculatedOdds {
    topicId: string;
    options: {
        optionId: string;
        amount: number;
        currentPayout: number;
    }[];
    timestamp: Date;
}

async function calculateAndUpdateOdds(vote:Vote):Promise<CalculatedOdds> {
  try {
    const newOdds: CalculatedOdds = {
        topicId: vote.topicId,
        options: [
          {
            optionId: vote.optionId,
            amount: vote.amount,
            currentPayout: 1.5 
          }
        ],
        timestamp: new Date()
      };
      return newOdds;
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function processVote(vote: Vote) {
    try {
      console.log('Processing vote:', vote);
      
      const newOdds = await calculateAndUpdateOdds(vote);
      
      // Later: Push to Redis/PubSub for API to consume
      console.log('Calculated new odds:', newOdds);
  
    } catch (error) {
      console.error('Error processing vote:', error);
    }
  }

  async function startWorker() {
    try {
      const connection = await amqp.connect(config.server.queue.url);
      const channel = await connection.createChannel();
      
      const QUEUE_NAME = config.server.queue.names.vote;
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      
      console.log('🚀 Engine worker connected to RabbitMQ');
      console.log('📮 Listening for votes on queue:', QUEUE_NAME);
  
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