import dotenv from "dotenv";

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3001,
    jwt: process.env.JWT_SECRET || "secretioh",
    queue:{
      url: process.env.AMQP_URL || "",
      names:{
        vote: 'vote_events'
      }
    },
    redis: {
      url: process.env.REDIS_URL || "redis://localhost:6379",
    },
    ws: {
      url: process.env.WS_PORT || 8080
    }
  },
  frontend:{
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
}