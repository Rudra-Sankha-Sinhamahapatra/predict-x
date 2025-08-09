import type { Response, Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, users, wallet, votes } from "@repo/db";
import { SignupSchema, SigninSchema } from "@repo/backend-common"
import { eq } from "drizzle-orm";
import { config } from "@repo/backend-common";

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const zodResult = SignupSchema.safeParse(req.body);
        if (!zodResult.success) {
            res.status(400).json({
                message: "Wrong inputs, validation failed",
                errors: zodResult.error
            });
            return;
        }

        const newUser = zodResult.data;

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, newUser.email)
        });

        if (existingUser) {
            res.status(409).json({
                message: "User already exists"
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(newUser.password, 10);


        const result = await db.insert(users).values({
            email: newUser.email,
            password: hashedPassword,
            name: newUser.name
        }).returning();

        const user = result[0];

        if(!user) {
          res.status(404).json({
            message: "User not found",
          })
          return;
        }

        await db.insert(wallet).values({
          userId: user.id,
        });

        const token = jwt.sign({ id: user?.id }, config.server.jwt);

        res.status(200).json({
            message: "User Signed Up Successfully",
            token,
            user
        });
    } catch (error: any) {
        console.error("Error: ", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = SigninSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: "Wrong inputs, validation failed",
                errors: result.error
            });
            return;
        }

        const { email, password } = result.data;

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!existingUser) {
            res.status(404).json({
                message: "User doesn't exist"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            res.status(400).json({
                message: "Invalid password"
            });
            return;
        }

        const token = jwt.sign({ id: existingUser.id }, config.server.jwt);

        res.status(200).json({
            message: "User Signed In Successfully",
            token,
            userId: existingUser.id,
            user: existingUser
        });
    } catch (error: any) {
        console.error("Error: ", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({
                message: "User not authenticated"
            });
            return;
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }

        const userWallet = await db.query.wallet.findFirst({
            where: eq(wallet.userId, userId)
        });

        const userVotes = await db.query.votes.findMany({
            where: eq(votes.userId, userId),
            with: {
                option: {
                    with: {
                        betting_board: true
                    }
                }
            }
        });

        const uniqueMarkets = new Set(userVotes.map(vote => vote.option.betting_board.id));
        const totalBets = uniqueMarkets.size;
        const totalInvested = userVotes.reduce((sum, vote) => sum + vote.amount, 0);
        
        const activeMarkets = new Set(
            userVotes
                .filter(vote => vote.option.betting_board.status === "OPEN")
                .map(vote => vote.option.betting_board.id)
        );
        const activeBets = activeMarkets.size;

        const resolvedMarkets = new Set(
            userVotes
                .filter(vote => vote.option.betting_board.status === "RESOLVED")
                .map(vote => vote.option.betting_board.id)
        );
        const wonBets = resolvedMarkets.size;  

        let accountLevel = "Beginner";
        if (totalBets >= 100) accountLevel = "Expert";
        else if (totalBets >= 50) accountLevel = "Advanced";
        else if (totalBets >= 20) accountLevel = "Intermediate";

        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            message: "User retrieved successfully",
            user: {
                ...userWithoutPassword,
                wallet: {
                    balance: userWallet?.token || 30
                },
                stats: {
                    totalBets,
                    totalInvested,
                    activeBets,
                    wonBets,
                    accountLevel,
                    winRate: totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(1) : "0.0"
                }
            }
        });
    } catch (error: any) {
        console.error("Error: ", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};