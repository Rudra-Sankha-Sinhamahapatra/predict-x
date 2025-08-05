ALTER TABLE "votes" ALTER COLUMN "amount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "expcted_return" real NOT NULL;