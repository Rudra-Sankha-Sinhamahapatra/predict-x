import express from "express"
import { authenticate } from "../middlewares/auth";
import { userVote } from "../controllers/votesController";

const router = express.Router();

router.post("/vote", authenticate, userVote);

export default router ;