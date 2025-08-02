import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { betting_board, options, votes, transactions, users } from "@repo/db";
import { eq } from "drizzle-orm";


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [topic] = await db
      .select()
      .from(betting_board)
      .where(eq(betting_board.id, params.id));

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    if (topic.status !== "RESOLVED") {
      return NextResponse.json(
        { error: "Topic not yet resolved" },
        { status: 400 }
      );
    }

    const topicOptions = await db
      .select()
      .from(options)
      .where(eq(options.bettingId, topic.id));

    const optionsWithVotes = await Promise.all(
      topicOptions.map(async (opt) => {
        const optionVotes = await db
          .select({
            vote: votes,
            user: users,
          })
          .from(votes)
          .where(eq(votes.optionId, opt.id))
          .leftJoin(users, eq(votes.userId, users.id));

        return {
          ...opt,
          votes: optionVotes,
        };
      })
    );


    const payoutTransactions = await db
      .select({
        transaction: transactions,
        user: users,
      })
      .from(transactions)
      .where(eq(transactions.type, "WIN"))
      .leftJoin(users, eq(transactions.userId, users.id));


    const totalVoteAmount = optionsWithVotes.reduce((sum, opt) => 
      sum + (opt.votes?.reduce((vsum, v) => vsum + (v.vote.amount || 0), 0) || 0), 
    0);

    const totalPaidOut = payoutTransactions.reduce((sum, tx) => 
      sum + (tx.transaction.amount || 0), 
    0);

    return NextResponse.json({
      topic: {
        ...topic,
        options: optionsWithVotes.map(opt => ({
          ...opt,
          totalVotes: opt.votes?.length || 0,
          totalAmount: opt.votes?.reduce((sum, v) => sum + (v.vote.amount || 0), 0) || 0,
        })),
      },
      statistics: {
        totalVoteAmount,
        totalPaidOut,
        totalWinners: payoutTransactions.length,
      },
      transactions: payoutTransactions,
    });
  } catch (error) {
    console.error("Error fetching topic results:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic results" },
      { status: 500 }
    );
  }
}