import { pgTable, text,uuid, timestamp, pgEnum, real,integer } from "drizzle-orm/pg-core";

export const bettingStatusEnum = pgEnum("topic_status", ["OPEN","CLOSED","RESOLVED"]);
export const categoryEnum = pgEnum("category",["SPORTS","POLITICS","TECH","MOVIES","SOCIALMEDIA","OTHER"]);
export const transactionTypeEnum = pgEnum("transaction_type", [
    "VOTE", "WIN", "REQUEST_GRANTED", "ADMIN_ADDED"
  ]);
  
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow()
});

export const betting_board = pgTable("betting_board",{
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    category: categoryEnum("category").notNull(),
    createdBy: text("created_by").notNull(),
    status: bettingStatusEnum("status").default("OPEN").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    resolvedAt: timestamp("resolved_at")
});

export const options = pgTable("options", {
    id: uuid("id").primaryKey().defaultRandom(),
    text: text("text").notNull(),
    bettingId: uuid("betting_id").notNull().references(() => betting_board.id, { onDelete: "cascade" } ),
    payout: real("payout")
});

export const votes = pgTable("votes", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    optionId: uuid("option_id").notNull().references(() => options.id),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow()
})

export const wallet = pgTable("wallet", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId:  uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: real("token").default(30),
    createdAt: timestamp("created_at").defaultNow()
})

export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: transactionTypeEnum("type").notNull(), 
    amount: real("amount").notNull(),
    relatedVoteId: uuid("vote_id").references(() => votes.id),
    createdAt: timestamp("created_at").defaultNow()
  });
  