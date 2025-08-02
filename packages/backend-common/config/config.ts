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
    }
  },
  frontend:{
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
}