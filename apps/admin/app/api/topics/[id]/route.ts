import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { betting_board, options, votes } from "@repo/db";
import { eq, and } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type BettingBoard = InferSelectModel<typeof betting_board>;
type Option = InferSelectModel<typeof options>;
type Vote = InferSelectModel<typeof votes>;

interface OptionWithVotes extends Option {
  votes: Vote[];
}

interface TopicWithOptions extends BettingBoard {
  options: OptionWithVotes[];
}

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

    const topicOptions = await db
      .select()
      .from(options)
      .where(eq(options.bettingId, topic.id));

    const optionsWithVotes = await Promise.all(
      topicOptions.map(async (opt) => {
        const optionVotes = await db
          .select()
          .from(votes)
          .where(eq(votes.optionId, opt.id));

        return {
          ...opt,
          votes: optionVotes,
        };
      })
    );

    const totalVotes = optionsWithVotes.reduce((sum, opt) => {
      const optionVotes = opt.votes?.length || 0;
      return sum + optionVotes;
    }, 0);

    const optionsWithPayouts = optionsWithVotes.map((opt) => {
      const optionVotes = opt.votes?.length || 0;
      return {
        ...opt,
        votes: undefined, 
        voteCount: optionVotes,
        currentPayout: totalVotes > 0 ? totalVotes / (optionVotes || 1) : opt.payout || 1.0,
      };
    });

    return NextResponse.json({
      ...topic,
      options: optionsWithPayouts,
      totalVotes,
    });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, winningOptionId } = body as { 
      status: "OPEN" | "CLOSED" | "RESOLVED";
      winningOptionId?: string;
    };

    if (!["OPEN", "CLOSED", "RESOLVED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    if (status === "RESOLVED") {
      if (!winningOptionId) {
        return NextResponse.json(
          { error: "Winning option ID required when resolving topic" },
          { status: 400 }
        );
      }

      const [winningOption] = await db
        .select()
        .from(options)
        .where(
          and(
            eq(options.id, winningOptionId),
            eq(options.bettingId, params.id)
          )
        );

      if (!winningOption) {
        return NextResponse.json(
          { error: "Invalid winning option ID" },
          { status: 400 }
        );
      }
    }

    const [updatedTopic] = await db
      .update(betting_board)
      .set({
        status,
        ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
      })
      .where(eq(betting_board.id, params.id))
      .returning();

    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 }
    );
  }
}