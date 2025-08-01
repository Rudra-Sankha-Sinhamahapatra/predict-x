import express from "express"
import { getAllBiddings, getBiddingById, getBiddingResults } from "../controllers/biddingController";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.get("/bidding-board/getall",getAllBiddings);
router.get("/bidding-board/:id",getBiddingById);
router.get("/bidding-board/:id/results", authenticate, getBiddingResults);

export default router ;