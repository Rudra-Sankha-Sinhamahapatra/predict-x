import dotenv from "dotenv";

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3001,
    jwt: process.env.JWT_SECRET || "secretioh"
  },
  frontend:{
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
}