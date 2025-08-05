import aqmp from "amqplib"
import { config } from "@repo/backend-common";
import type { AmqpChannel, AmqpConnection, Vote } from "@repo/backend-common"

const QUEUE_NAME = config.server.queue.names.vote;
const QUEUE_URL = config.server.queue.url;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

export async function connectToRabbitMQ() {
   try {
    if(connection && channel) {
      console.log("Connection & channel already established");
      return true;
    }

    connection = await aqmp.connect(QUEUE_URL);

    connection.on('error', (err:any) => {
      console.error('RabbitMQ Connection Error:', err);
      channel = null;
    });

    connection.on('close', () => {
      console.log('RabbitMQ Connection Closed');
      channel = null;
  });

  channel = await connection.createChannel();

  channel.on('error', (err: any) => {
    console.error('RabbitMQ Channel Error:', err);
  });

  channel.on('close', () => {
    console.log('RabbitMQ Channel Closed');
  });

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
  });

  console.log("Channel Created");
  console.log("Queue Connection Established");
  return true;
   } catch (error) {
    console.error("Failed to initialize RabbitMQ connection ", error);
    await closeQueue();
    throw error;
   }
}

export const closeQueue = async () => {
  try {
      if(channel && !channel.close) {
        console.log("Closing channel");
        await channel.close();
        console.log("Channel closed");
      }
      if(connection && !connection.close) {
        console.log("Closing connection");
        await connection.close();
        console.log("Connection closed");
      }
  } catch (error) {
    console.log("Error closing queue: ",error)
  } finally {
      channel = null;
      connection = null;
  }
}

export async function publishVoteEvent(voteData:Vote) {
  try {
    if(!channel) {
      await connectToRabbitMQ();
    }
    if(!channel) throw new Error("Channel not found");

    const messageWithTimeStamp = {
      ...voteData,
      timestamp: Date.now(),
    };

    const success = await channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(messageWithTimeStamp)),
      {
        persistent : true,
        contentType: 'application/json',
        expiration: '86400000', // 24 hrs
        timestamp: Date.now(),
        messageId: `vote-${Date.now()}`
      }
    );

    if(success) {
      console.log("Vote published to queue:", voteData);
  } 

  return success;
  } catch (error) {
    console.error("Error publishing vote to queue: ", error);
    throw error;
  }
}