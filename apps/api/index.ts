import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from 'cookie-parser';
import { config } from "@repo/backend-common";
import userRouter from "./routes/user"
import biddingRouter from "./routes/biddings"
import voteRouter from "./routes/votes"

const app = express();
app.use(cookieParser());
app.use(express.json());

const corsOptions={
    origin: config.frontend.url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-session', 'x-user-id', 'Cookie']
  }

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.json({
        "msg":"Hello World!"
    });
  });

  app.use("/api/v1/user",userRouter);
  app.use("/api/v1/biddings",biddingRouter);
  app.use("/api/v1/votes",voteRouter);
  

const startServer = async () => {
  try {
    app.listen(config.server.port, () => {
      console.log(`Server is running on port ${config.server.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();