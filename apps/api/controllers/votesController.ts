import { db, options, transactions, votes, wallet } from "@repo/db";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { publishVoteEvent } from "../lib/queue";

export const userVote = async(req:Request,res:Response): Promise<void> => {
    try {
        const { optionId, amount } = req.body;
        const userId = req.userId;

        if(!userId) {
            res.status(401).json({
                message: "User not authenticated"
            });
            return;
        }

        if (!optionId || !amount || amount <= 0) {
            res.status(400).json({
                message: "Invalid optionId or amount"
            });
            return;
        }

        const option = await db.query.options.findFirst({
            where: eq(options.id, optionId),
            with: {
                betting_board: true
            }
        });

        if (!option) {
            res.status(404).json({
                message: "Option not found"
            });
            return;
        }

        if (option.betting_board.status !== "OPEN") {
            res.status(400).json({
                message: "Betting is closed for this topic"
            });
            return;
        }

        const userWallet = await db.query.wallet.findFirst({
            where: eq(wallet.userId, userId)
        });

  
        if (!userWallet || userWallet.token! < amount) {
            res.status(400).json({ message: "Insufficient tokens" });
            return;
          }

        const existingVote = await db.query.votes.findFirst({
            where: and(
                eq(votes.userId,userId),
                eq(votes.optionId,optionId)
            )
        });

        if (existingVote) {
            res.status(400).json({
                message: "You have already voted on this option"
            });
            return;
        }

        const result = await db.transaction(async (tx) => {
            const newVote = await tx.insert(votes).values({
                userId,
                optionId,
                amount
            }).returning();

            if(!userWallet?.token) {
                res.status(400).json({
                    message: "Insufficient tokens"
                });
                return; 
            }

            await tx.update(wallet)
            .set({ token: userWallet.token - amount })

            if(!newVote[0]) {
                res.status(400).json({
                    message: "no vote found"
                });
                return; 
            }

            await tx.insert(transactions).values({
                userId,
                type: "VOTE",
                amount: -amount,
                relatedVoteId: newVote[0].id
            });

            return newVote[0];

        });

        try {
            await publishVoteEvent({
                userId,
                topicId: option.betting_board.id,
                optionId,
                amount
            });
        } catch (queueError) {
            console.error("Failed to publish to queue:", queueError);
        }

        res.status(200).json({
            message: "Vote placed successfully",
            vote: result
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
        return;
    }
}
