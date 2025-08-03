import { pgTable, text,uuid, timestamp, pgEnum, real,integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
  

export const usersRelations = relations(users, ({ one, many }) => ({
  votes: many(votes),
  wallet: one(wallet),
  transactions: many(transactions)
}));

export const bettingBoardRelations = relations(betting_board, ({ one, many }) => ({
  options: many(options),
}));

export const optionsRelations = relations(options, ({ one, many }) => ({
  betting_board: one(betting_board, {
    fields: [options.bettingId],
    references: [betting_board.id]
  }),
  votes: many(votes)
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id]
  }),
  option: one(options, {
    fields: [votes.optionId],
    references: [options.id]
  })
}));

export const walletRelations = relations(wallet, ({ one }) => ({
  user: one(users, {
    fields: [wallet.userId],
    references: [users.id]
  })
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  vote: one(votes, {
    fields: [transactions.relatedVoteId],
    references: [votes.id]
  })
}));
