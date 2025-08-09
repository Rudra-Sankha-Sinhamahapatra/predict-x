import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { betting_board, options, votes } from "@repo/db";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const topics = await db
      .select()
      .from(betting_board)
      .orderBy(desc(betting_board.createdAt));

    const topicsWithOptions = await Promise.all(
      topics.map(async (topic) => {
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
              voteCount: optionVotes.length,
              currentPayout: opt.payout || 1.5,
            };
          })
        );

        const totalVotes = optionsWithVotes.reduce((sum, opt) => sum + opt.voteCount, 0);

        return {
          ...topic,
          options: optionsWithVotes,
          totalVotes,
        };
      })
    );

    return NextResponse.json(topicsWithOptions);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, options: topicOptions } = body;


    if (!["SPORTS", "POLITICS", "TECH", "MOVIES", "SOCIALMEDIA", "OTHER"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const [topic] = await db
      .insert(betting_board)
      .values({
        title,
        category,
        createdBy: "admin", 
        status: "OPEN",
      })
      .returning();

    const optionsToCreate = topicOptions.map((opt: { text: string; payout?: number }) => ({
      text: opt.text,
      bettingId: topic.id,
      payout: opt.payout || 1.0, 
    }));

    const createdOptions = await db.insert(options).values(optionsToCreate).returning();

    return NextResponse.json({
      ...topic,
      options: createdOptions,
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}