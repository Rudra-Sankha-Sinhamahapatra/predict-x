import { db, betting_board, options, votes, users } from "@repo/db";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import redisClient from "../redisClient";

export const getAllBiddings = async (req: Request, res: Response): Promise<void> => {
  try {
    const allBiddings = await db
    .select()
    .from(betting_board)
    .where(eq(betting_board.status,"OPEN"));

    res.status(200).json({
        message:"fetched all active biddings",
        allBiddings
    })

  } catch (error) {
    console.log("error",error);
    res.status(500).json({
        message: "Internal server error"
      });
  }
}

export const getBiddingById = async(req:Request,res:Response) : Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
              message: "Bidding ID is required"
            });
            return;
          }

          const redisOddsKey = `latest_odds:${id}`;
          const latestOddsString = await redisClient.get(redisOddsKey);

          if(latestOddsString) {
            const getBidding = await db.query.betting_board.findFirst({
                where: eq(betting_board.id, id),
            });

            if(!getBidding) {
                res.status(404).json({
                    message: "Bidding not found"
                  });
                  return;
            }
            res.status(200).json({
                message: "Bidding received successfully",
                bidding: getBidding,
                latestOdds: JSON.parse(latestOddsString)
            });
            return;
          }
     
          const getBidding = await db.query.betting_board.findFirst({
            where: eq(betting_board.id, id),
            with: { options: true }
        });

        if (!getBidding) {
            res.status(404).json({ message: "Bidding not found" });
            return;
        }

        const initialOdds = {
            topicId: id,
            options: getBidding.options.map(opt => ({
                optionId: opt.id,
                amount: 0,
                currentPayout: opt.payout || 1.5,
            })),
            timestamp: new Date(),
        };

        await redisClient.set(redisOddsKey, JSON.stringify(initialOdds));

        res.status(200).json({
            message:"Bidding received successfully",
            bidding: getBidding,
            latestOdds: initialOdds,
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
          });
          return;
    }
}


export const getBiddingResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                message: "Bidding ID is required"
            });
            return;
        }

        const bidding = await db
            .select()
            .from(betting_board)
            .where(eq(betting_board.id, id))
            .limit(1);

        if (!bidding || bidding.length === 0) {
            res.status(404).json({
                message: "Bidding not found"
            });
            return;
        }

        const currentBidding = bidding[0];

        if(!currentBidding) {
            res.status(404).json({
                message: "Bidding not found"
            });
            return;
        }

        if (currentBidding.status !== "RESOLVED") {
            res.status(400).json({
                message: "Bidding is not yet resolved",
                status: currentBidding.status
            });
            return;
        }

        const biddingOptions = await db
            .select({
                optionId: options.id,
                optionText: options.text,
                payout: options.payout
            })
            .from(options)
            .where(eq(options.bettingId, id));

        const results = await Promise.all(
            biddingOptions.map(async (option) => {
                const optionVotes = await db
                    .select({
                        vote: votes,
                        user: {
                            id: users.id,
                            name: users.name
                        }
                    })
                    .from(votes)
                    .where(eq(votes.optionId, option.optionId))
                    .leftJoin(users, eq(votes.userId, users.id));

                const totalAmount = optionVotes.reduce((sum, vote) => sum + vote.vote.amount, 0);
                const totalVotes = optionVotes.length;

                return {
                    option: {
                        id: option.optionId,
                        text: option.optionText,
                        payout: option.payout
                    },
                    votes: optionVotes.map(v => ({
                        user: v.user,
                        amount: v.vote.amount,
                        timestamp: v.vote.createdAt
                    })),
                    stats: {
                        totalVotes,
                        totalAmount
                    }
                };
            })
        );

        res.status(200).json({
            message: "Bidding results retrieved successfully",
            bidding: {
                id: currentBidding.id,
                title: currentBidding.title,
                category: currentBidding.category,
                createdBy: currentBidding.createdBy,
                createdAt: currentBidding.createdAt,
                resolvedAt: currentBidding.resolvedAt,
                status: currentBidding.status
            },
            results,
        });

    } catch (error) {
        console.error("Error fetching bidding results:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};