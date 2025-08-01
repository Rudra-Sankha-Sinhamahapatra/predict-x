import express from "express"
import { getMe, signin, signup } from "../controllers/userController";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.post("/signin",signin);
router.post("/signup",signup);
router.get("/me", authenticate, getMe);

export default router ;